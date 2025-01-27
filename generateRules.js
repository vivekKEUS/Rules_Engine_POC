import { v4 as uuidv4 } from 'uuid';

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
            "eventId":"RelaxedModeAutomation",
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
                            "deviceId": "device-1"
                        }
                    }
                },
            ]
        }
    }
}
