'use strict'
/*
 * This example demonstrates computing fact values at runtime, and leveraging the 'path' feature
 * to select object properties returned by facts
 *
 * Usage:
 *   node ./examples/03-dynamic-facts.js
 *
 * For detailed output:
 *   DEBUG=json-rules-engine node ./examples/03-dynamic-facts.js
 */

const { Engine, Almanac } = require('json-rules-engine')

async function start() {
    /**
     * Setup a new engine
     */
    const engine = new Engine()
    const customRule = {
        "conditions": {
            "all": [
                {
                    "any": [
                        {
                            "fact": "time",
                            "operator": "greaterThanInclusive",
                            "value": "00:00",
                            "params": {
                                "eventId": "RelaxedModeAutomation",
                                "ruleId": "67972267f19e4b0b7bba5296",
                                "serviceId": "calendar",
                                "factState": "currentTime",
                                "recurrenPattern": {
                                    "StartDate": "2025-01-01",
                                    "EndDate": "2030-01-01",
                                    "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
                                }
                            },
                            "path": "time"
                        }
                    ]
                },
                {
                    "any": [
                        {
                            "fact": "time",
                            "operator": "lessThanInclusive",
                            "value": "18:00",
                            "params": {
                                "eventId": "FanOffAutomation",
                                "ruleId": "67972267f19e4b0b7bba5296",
                                "serviceId": "calendar",
                                "factState": "currentTime",
                                "recurrenPattern": {
                                    "StartDate": "2025-01-01",
                                    "EndDate": "2030-01-01",
                                    "RecurrentPattern": "MO,TU,WE,TH,FR,SAT,SUN"
                                }
                            },
                            "path": "time"
                        }
                    ]
                }
            ]
        },
        "event": {
            "type": "Fan Off Automation",
            "params": {
                "actions": [
                    {
                        "id": "7a309674-0f76-4dfb-9aba-2c2c6efba42b",
                        "type": "automation",
                        "name": "Fan Turning On Automation",
                        "strategy": "durable",
                        "waitTillCompletion": false,
                        "actionData": {
                            "serviceId": "FanService",
                            "emitTriggerAction": "p2.trigger-fan-state-change",
                            "customActionData": {
                                "deviceId": "device-1",
                                "state": "off"
                            },
                            "_id": "67972267f19e4b0b7bba52a0"
                        },
                        "_id": "67972267f19e4b0b7bba529f"
                    }
                ],
                "_id": "67972267f19e4b0b7bba529e"
            },
            "_id": "67972267f19e4b0b7bba529d"
        }
    }
    engine.addRule(customRule)
    const facts = {'time':"18:00"}
    const { events } = await engine.run({'time':"18:00"})

    console.log(JSON.stringify(facts) + ' is a ' + events.length)
}
start()

/*
 * OUTPUT:
 *
 * loading account information for "lincoln"
 * lincoln is a current microsoft employee taking christmas day off
 *
 * NOTES:
 *
 * - Notice that although all 3 conditions required data from the "account-information" fact,
 *   the account-information api call is executed only ONCE.  This is because fact results are
 *   cached by default, increasing performance and lowering network requests.
 *
 * - See the 'fact' docs on how to disable fact caching
 */