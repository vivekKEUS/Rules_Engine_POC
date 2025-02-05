 import { ServiceBroker } from "moleculer";
import { RulesEngineService } from "./plugin-general-rulesengine";
import CalendarService from "./plugin-calender";
import CronManager from "./plugin-cron-manager";
import { connectToDatabase } from "./model";
import { v4 as uuidv4 } from 'uuid';
import { brokerConfig } from "./moleculer.config";
import { FanService } from "./plugin-fan";
import { lightService } from "./plugin-lighting";
import { AsyncDelay } from "./types";
import { FactsDiscoveryService } from "./plugin-fact-trigger-discoverer";


const broker = new ServiceBroker(brokerConfig);

broker.createService(RulesEngineService);
broker.createService(CalendarService);
broker.createService(CronManager);
broker.createService(FanService)
broker.createService(lightService)
broker.createService(FactsDiscoveryService)
await connectToDatabase();
const rule6 = {
    "name": "TurnOnLightsThenTurnOnFans",
    "desc": "Turn on lights and fans of bedroom, after 3 seconds turn off lights of porch",
    conditions: [{
        "id": "FanAutomationConditionSet1",
        "name": "daily time check 1",
        "conditions": [{
            "id": uuidv4(),
            "name": "time check",
            "type": "time",
            "operation": "greaterThanInclusive",
            "eventId": "FanOffAutomation",
            "factName": "time",
            "factValue": 1200,
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId": "calendar", //service from which we will get the current fact's value
            "factStateAction": "currentTime", //returns time in 24 hours format
        }]
    }, {
        "id": "FanAutomationConditionSet2",
        "name": "daily time check 2",
        "conditions": [{
            "id": uuidv4(),
            "name": "time check 2",
            "type": "time",
            "operation": "lessThanInclusive",
            "eventId": "FanOffAutomation",
            "factName": "time",
            "factValue": 2359,
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId": "calendar",
            "factStateAction": "currentTime",
        }]
    }],
    "event": {
        "type": "F",
        "id": "LightFansOnAutomation",
        "params": {
            "actions": [
                {
                    "order": 0,
                    "triggers": [
                        {
                            "id": uuidv4(),
                            "type": "automation",
                            "name": "Light Turning On Automation",
                            "strategy": "durable",
                            "waitTillCompletion": false,
                            "actionData": {
                                "serviceId": "kiotp.plugins.general.lighting",
                                // "emitTriggerAction": "p2.trigger-bulb-state-change",
                                "emitTriggerAction": "BulbStateChange",
                                "customActionData": {
                                    "deviceId": "device-1B",
                                    "state": "on",
                                },
                            },
                        },
                        {
                            "id": uuidv4(),
                            "type": "automation",
                            "name": "Fan Turning On Automation",
                            "strategy": "durable",
                            "waitTillCompletion": false,
                            "actionData": {
                                "serviceId": "kiotp.plugins.general.fan",
                                "emitTriggerAction": "ChangeFanState",
                                "customActionData": {
                                    "deviceId": "device-2F",
                                    "state": "on",
                                },
                            },
                        }
                    ]
                },
                {
                    "order":1,
                    "delay": 10,
                },
                {
                    "order":2,
                    "triggers": [
                        {
                            "id": uuidv4(),
                            "type": "automation",
                            "name": "Fan Turning Off Automation",
                            "strategy": "durable",
                            "waitTillCompletion": false,
                            "actionData": {
                                "serviceId": "kiotp.plugins.general.fan",
                                "emitTriggerAction": "ChangeFanState",
                                "customActionData": {
                                    "deviceId": "device-88F",
                                    "state": "off",
                                },
                            },
                        }
                    ]
                }
            ],
        }
    },
    "enabled": true,
    "priority": 5,
}
broker.start()
    .then(async () => {
        // Add a cron job to log every 1 minute
        await broker.call("1.0.0.cron.manager.addJob", {
            id: "logsevery1Minutes",
            cronExpression: "* * * * *",
            taskFunction: async () => {
                console.log("This message is logged every 1 minute starting from 00:00");
                broker.sendToChannel("p2.facts.state.changed", { facts: ["time"], id: "FanOffAutomation" });
            },
        });

        try {
            // Wait for required services and add a rule to the rules engine
            await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine");
            // await broker.call("1.0.0.kiotp.plugins.general.rulesengine.AddRule", rule5);
            await broker.call("1.0.0.kiotp.plugins.general.rulesengine.AddRule", rule6);
            console.log("Rule 5 & 6 added successfully to the rules engine");
        } catch (error) {
            console.error("Error during adding rule 5 with the rules engine:", error);
        }
    })
    .catch((err) => {
        console.error("Error starting broker:", err);
    });

