import { ServiceBroker } from "moleculer";
import { RulesEngineService } from "./plugin-general-rulesengine";
import CalendarService from "./plugin-calender/index";
import CronManager from "./plugin-cron-manager";
import { connectToDatabase } from "./model";
import { v4 as uuidv4 } from 'uuid';
import { brokerConfig } from "./moleculer.config";
const broker = new ServiceBroker(brokerConfig);

broker.createService(RulesEngineService);
broker.createService(CalendarService);
broker.createService(CronManager);

await connectToDatabase();

const rule1 = {
    "name": "Meeting Room Lights On",
    "conditions": [{
        "id": uuidv4(),
        "name": "weekdays check",
        "conditions": [{
            "id": uuidv4(),
            "name": "weekdays check",
            "type": "time",
            "operation": "greaterThanInclusive",
            "eventId": "light automation",
            "factName": "time",
            "factValue": "06:00",
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR"
            },
            "serviceId": "CalendarService"
        }]
    }],
    "event": {
        "type": "light automation",
        "id": uuidv4(),
        "params": {
            "actions": [
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Open Curtains",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "curtainService",
                        "emitTriggerAction": "openCurtains",
                        "customActionData": {
                            "message": "Open Curtains",
                            "data": ["device-1", "device-2", "device-3"]
                        }
                    }
                },
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Turn On Lights",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "lightService",
                        "emitTriggerAction": "turnOnLights",
                        "customActionData": {
                            "message": "Turn On Lights"
                        }
                    }
                }
            ]
        }
    }
}
const rule2 = {
    "name": "Meeting Room Lights Off",
    "conditions": [{
        "id": uuidv4(),
        "name": "weekdays check lights off",
        "conditions": [{
            "id": uuidv4(),
            "name": "weekdays check",
            "type": "time",
            "operation": "lessThanInclusive",
            "eventId": "light automation",
            "factName": "time",
            "factValue": "21:00",
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
            },
            "serviceId": "CalendarService"
        },{
            "id": uuidv4(),
            "name": "weekdays check",
            "type": "motion detection",
            "operation": "equalTo",
            "eventId": "light motion automation",
            "factName": "motionDectected",
            "factValue": false,
            "serviceId": "MotionDetectionService"
        }]
    }],
    "event": {
        "type": "light automation",
        "id": uuidv4(),
        "params": {
            "actions": [
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Close Curtains",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "curtainService",
                        "emitTriggerAction": "closeCurtains",
                        "customActionData": {
                            "message": "Close Curtains",
                            "data": ["device-1", "device-2", "device-3"]
                        }
                    }
                },
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Turn Off Lights",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "lightService",
                        "emitTriggerAction": "turnOffLights",
                        "customActionData": {
                            "message": "Turn Off Lights"
                        }
                    }
                }
            ]
        }
    }
}

const rule3 = {
    "name": "Relaxed Mode",
    "conditions": [{
        "id": "RelaxedModeConditionSet1",
        "name": "daily time check 1",
        "conditions": [{
            "id": uuidv4(),
            "name": "time check",
            "type": "time",
            "operation": "greaterThanInclusive",
            "eventId": "RelaxedModeAutomation",
            "factName": "time",
            "factValue": "18:00",
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId": "CalendarService"
        }]
    },{
        "id" : "RelaxedModeConditionSet2",
        "name":"daily time check 2",
        conditions:[{
            "id": uuidv4(),
            "name":"time check 2",
            "type":"time",
            "operation":"lessThanInclusive",
            "eventId":"RelaxedModeAutomation",
            "factName":"time",
            "factValue":"23:59",
            "factObject":{
                "StartDate":"2025-01-01",
                "EndDate":"2030-01-01",
                "RecurrentPattern":"MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId":"CalendarService"
        }]
    }],
    "event": {
        "type": "Relaxed Mode Automation",
        "id": "RelaxedModeAutomation",
        "params": {
            "actions": [
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Relaxed Lighting",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "LightingService",
                        "emitTriggerAction": "openCurtains",
                        "customActionData": {
                            "message": "Turn on Relaxed Lighting",
                            "data": ["device-1", "device-2", "device-3"]
                        }
                    }
                },
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Turn On Lights",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "lightService",
                        "emitTriggerAction": "turnOnLights",
                        "customActionData": {
                            "message": "Turn On Lights"
                        }
                    }
                }
            ]
        }
    }
}

const rule4 = {
    "name": "Fan Automation",
    "conditions": [{
        "id": "FanAutomationConditionSet1",
        "name": "daily time check 1",
        "conditions": [{
            "id": uuidv4(),
            "name": "time check",
            "type": "time",
            "operation": "greaterThanInclusive",
            "eventId": "RelaxedModeAutomation",
            "factName": "time",
            "factValue": "18:00",
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId": "PlaceHolderCalenderService"
        }]
    },{
        "id" : "FanAutomationConditionSet2",
        "name":"daily time check 2",
        conditions:[{
            "id": uuidv4(),
            "name":"time check 2",
            "type":"time",
            "operation":"lessThanInclusive",
            "eventId":"FanOnAutomation",
            "factName":"time",
            "factValue":"23:59",
            "factObject":{
                "StartDate":"2025-01-01",
                "EndDate":"2030-01-01",
                "RecurrentPattern":"MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId":"PlaceHolderCalendarService"
        }]
    }],
    "event": {
        "type": "Fan On Automation",
        "id": "FanOnAutomation",
        "params": {
            "actions": [
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Fan Turning On Automation",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "FanService",
                        "emitTriggerAction": "p2.trigger-fan-state-change",
                        "customActionData": {
                            "deviceId": "device-1",
                            "state": "on",
                        }
                    }
                },
            ]
        }
    }
}
const rule5 = {
    "name": "Fan Off Automation",
    "conditions": [{
        "id": "FanAutomationConditionSet1",
        "name": "daily time check 1",
        "conditions": [{
            "id": uuidv4(),
            "name": "time check",
            "type": "time",
            "operation": "greaterThanInclusive",
            "eventId": "RelaxedModeAutomation",
            "factName": "time",
            "factValue": "00:00",
            "factObject": {
                "StartDate": "2025-01-01",
                "EndDate": "2030-01-01",
                "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId": "PlaceHolderCalenderService"
        }]
    },{
        "id" : "FanAutomationConditionSet2",
        "name":"daily time check 2",
        conditions:[{
            "id": uuidv4(),
            "name":"time check 2",
            "type":"time",
            "operation":"lessThanInclusive",
            "eventId":"FanOffAutomation",
            "factName":"time",
            "factValue":"18:00",
            "factObject":{
                "StartDate":"2025-01-01",
                "EndDate":"2030-01-01",
                "RecurrentPattern":"MO,TU,WE,TH,FR,SAT,SUN"
            },
            "serviceId":"PlaceHolderCalendarService"
        }]
    }],
    "event": {
        "type": "Fan Off Automation",
        "id": "FanOffAutomation",
        "params": {
            "actions": [
                {
                    "id": uuidv4(),
                    "type": "automation",
                    "name": "Fan Turning On Automation",
                    "strategy": "durable",
                    "waitTillCompletion": false,
                    "actionData": {
                        "serviceId": "FanService",
                        "emitTriggerAction": "p2.trigger-fan-state-change",
                        "customActionData": {
                            "deviceId": "device-1",
                            "state" : "off",
                        }
                    }
                },
            ]
        }
    },
    "enabled":true,
}
// async function main(){
//     await broker.start()
//     await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine")
//     broker.sendToChannel("p2.rule.added",rule1)
//     broker.sendToChannel("p2.rule.added",rule2)
//     broker.sendToChannel("p2.facts.state.changed",rule1)
//     console.log("The, Worrdo!")
// }
broker.start()
  .then(async () => {
    // Add a cron job to log every 1 minute
    await broker.call("cron.manager.addJob", {
      id: "logsevery1Minutes",
      cronExpression: "* * * * *",
      taskFunction: () => {
        console.log("This message is logged every 1 minute starting from 00:00");
        broker.sendToChannel("p2.facts.state.changed", { facts: ["time"] });
      },
    });

    try {
      // Wait for required services and add a rule to the rules engine
      await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine");
      await broker.call("1.0.0.kiotp.plugins.general.rulesengine.AddRule", rule5);
      console.log("Rule 5 added successfully to the rules engine");
    } catch (error) {
      console.error("Error during adding rule 5 with the rules engine:", error);
    }
  })
  .catch((err) => {
    console.error("Error starting broker:", err);
  });
