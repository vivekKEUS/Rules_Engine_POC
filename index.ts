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
                "RecurrentPattern": "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR"
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

async function main(){
    await broker.start()
    await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine")
    broker.sendToChannel("p2.rule.added",rule1)
    broker.sendToChannel("p2.rule.added",rule2)
    broker.sendToChannel("p2.facts.state.changed",rule1)
    console.log("The, Worrdo!")
}

main()