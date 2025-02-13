 import { ServiceBroker } from "moleculer";
import { RulesEngineService } from "./plugin-general-rulesengine";
import CalendarService from "./plugin-calender";
import CronManager from "./plugin-cron-manager";
import { v4 as uuidv4 } from 'uuid';
import { randomUUIDv7 } from "bun";
import { brokerConfig } from "./moleculer.config";
import { FanService } from "./plugin-fan";
import { lightService } from "./plugin-lighting";
import { connectToDatabase } from "./model";

const broker = new ServiceBroker(brokerConfig);

broker.createService(RulesEngineService);
broker.createService(CalendarService);
broker.createService(CronManager);
broker.createService(FanService)
broker.createService(lightService)
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
            "factName": "time",
            "factValue": 1200,
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
            "factName": "time",
            "factValue": 2359,
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
const rule7 = {
    "name": "FanOnConsequent",
    "desc": "Turn on light, and after 10 seconds make the color of light red",
    conditions:[{
        "id": "FanOnConditionSet1",
        "name": "Fan On Starter",
        "conditions":[{
            "id": randomUUIDv7(),
            "name": "Fan On Condition",
            "type": "fan-power-state",
            "operation": "equal",
            "factValue": "on",
            "serviceId": "kiotp.plugins.general.fan",
            "factStateAction": "GetFanState",
        }]
    }],
    "event" : {
        "type": "FanOnSuccess",
        "id": "FanOnConsequent",
        "params":{
            "actions":[
                {
                    "order": 0,
                    "triggers":[
                        {
                            "id": randomUUIDv7(),
                            "type": "automation",
                            "name": "Light Turning On Automation",
                            "strategy": "durable",
                            "waitTillCompletion": true,
                            "actionData":{
                                "serviceId": "kiotp.plugins.general.lighting",
                                "emitTriggerAction": "BulbStateChange",
                                "customActionData":{
                                    "deviceId": "device-1B",
                                    "state": "on",
                                }
                            }
                        }
                    ]
                },{
                    "order":1,
                    "delay": 10,
                },{
                    "order":2,
                    "triggers":[
                        {
                            "id": randomUUIDv7(),
                            "name": "Change Light Color Automation",
                            "strategy": "durable",
                            "waitTillCompletion": true,
                            "actionData":{
                                "serviceId": "kiotp.plugins.general.lighting",
                                "emitTriggerAction": "BulbColorChange",
                                "customActionData":{
                                    "deviceId": "device-1B",
                                    "color": "red",
                                }
                            }
                        }
                    ]
                }
            ]
        }
    }
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

