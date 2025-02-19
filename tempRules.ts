{
    "success": true,
    "data": [
        {
            "id": "67ae0bbf94b323059cb9d7e4",
            "name": "Movie",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Execute ambience scene|Movie",
                        "eventId": "69N5CEW4lP-165",
                        "type": "SCENE",
                        "factName": "mainhub-current-scene-state",
                        "factValue": "69N5CEW4lP-165",
                        "factObject": {},
                        "factStateAction": "GetCurrentScene",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.general.hubbridge"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute media scene|Sony LIV",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-deepmedia-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "67ae0b5ac29025e66d20cdfd"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "69N5CEW4lP",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b455cef4b7f8fe319162fd",
            "name": "Movie",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Execute ambience scene|Movie",
                        "eventId": "KuFFBN1K5K-165",
                        "type": "SCENE",
                        "factName": "mainhub-current-scene-state",
                        "factValue": "KuFFBN1K5K-165",
                        "factObject": {},
                        "factStateAction": "GetCurrentScene",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.general.hubbridge"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute media scene|Chill",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-deepmedia-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "67b0536372cdc09958ef3644"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "KuFFBN1K5K",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b45864f4b7f8fe31916303",
            "name": "Movie",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Execute ambience scene|Movie",
                        "eventId": "3PsWpGjXvC-185",
                        "type": "SCENE",
                        "factName": "mainhub-current-scene-state",
                        "factValue": "3PsWpGjXvC-185",
                        "factObject": {},
                        "factStateAction": "GetCurrentScene",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.general.hubbridge"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute media scene|Netflix",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-deepmedia-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "67b457a972cdc09958ef364b"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "3PsWpGjXvC",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b458e8f4b7f8fe31916304",
            "name": "Play",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Entertainment Room|When content is playing",
                        "eventId": "67b4578772cdc09958ef3649",
                        "type": "STATE",
                        "factName": "appletv-playing-state",
                        "factValue": "playing",
                        "factObject": {},
                        "factStateAction": "GetPlayFactState",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.core.deepmedia.tv.appletv"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute ambience scene|Apple tv play",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-mainhub-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "3PsWpGjXvC-172"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "3PsWpGjXvC",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b458f5f4b7f8fe31916305",
            "name": "Pause",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Entertainment Room|When content is paused",
                        "eventId": "67b4578772cdc09958ef3649",
                        "type": "STATE",
                        "factName": "appletv-playing-state",
                        "factValue": "paused",
                        "factObject": {},
                        "factStateAction": "GetPlayFactState",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.core.deepmedia.tv.appletv"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute ambience scene|Apple TV pause",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-mainhub-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "3PsWpGjXvC-171"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "3PsWpGjXvC",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b597884b7681948a823274",
            "name": "RulesEngine2Testing",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Entertainment Room|When content is playing",
                        "eventId": "67b4578772cdc09958ef3649",
                        "type": "STATE",
                        "factName": "appletv-playing-state",
                        "factValue": "playing",
                        "factObject": {},
                        "factStateAction": "GetPlayFactState",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.core.deepmedia.tv.appletv"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute media scene|Netflix",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-deepmedia-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "67b457a972cdc09958ef364b"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "3PsWpGjXvC",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        },
        {
            "id": "67b597f44b7681948a823275",
            "name": "Test",
            "description": "",
            "conditions": [
                [
                    {
                        "id": "0",
                        "operation": "equal",
                        "name": "Entertainment Room|When content is playing",
                        "eventId": "67b4578772cdc09958ef3649",
                        "type": "STATE",
                        "factName": "appletv-playing-state",
                        "factValue": "playing",
                        "factObject": {},
                        "factStateAction": "GetPlayFactState",
                        "factPath": null,
                        "serviceId": "kiotp.plugins.core.deepmedia.tv.appletv"
                    }
                ]
            ],
            "event": {
                "type": "rule",
                "params": {
                    "routines": [
                        {
                            "id": "0",
                            "type": "ACTION",
                            "name": "Execute media scene|Netflix",
                            "strategy": null,
                            "maxTimeDifferenceMs": null,
                            "waitTillCompletion": true,
                            "actionData": {
                                "serviceId": "",
                                "emitTriggerAction": "p1.trigger-deepmedia-scene-state-change",
                                "deviceType": null,
                                "devcieCategory": null,
                                "customActionData": {
                                    "sceneId": "67b457a972cdc09958ef364b"
                                }
                            }
                        }
                    ]
                }
            },
            "enabled": true,
            "roomId": "3PsWpGjXvC",
            "conditionIds": [
                "1"
            ],
            "conditionSetNames": [
                "set-1"
            ]
        }
    ]
}