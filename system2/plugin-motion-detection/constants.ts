export enum FACTS {
    MOTION_STATE = "motion-detection-state",
    SENSITIVITY = "motion-sensitivity-level",
    ALERT_MODE = "motion-alert-mode"
}

export enum EVENTS {
    TRIGGER_MOTION_STATE_CHANGE = "p2.trigger-motion-state-change",
    TRIGGER_SENSITIVITY_CHANGE = "p2.trigger-motion-sensitivity-change",
    TRIGGER_ALERT_MODE_CHANGE = "p2.trigger-motion-alert-mode-change"
}

export enum Triggers {
    MOTION_STATE = "p2.motion-detection-state",
    SENSITIVITY = "p2.motion-sensitivity-change",
    ALERT_MODE = "p2.motion-alert-mode-change"
}

export enum MOTION_STATE {
    DETECTED = "detected",
    NOT_DETECTED = "not_detected"
}

export enum SENSITIVITY_LEVELS {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

export enum ALERT_MODES {
    SILENT = "silent",
    NOTIFICATION = "notification",
    ALARM = "alarm"
}

export const FACTS_AND_TRIGGERS = {
    "TRIGGERS": [
        {
            displayName: "Change Motion Detection State",
            eventName: EVENTS.TRIGGER_MOTION_STATE_CHANGE, 
            executionStrategy: 'durable', 
            params: {
                deviceId: ""
            }
        },
        {
            displayName: "Change Motion Sensitivity Level",
            eventName: EVENTS.TRIGGER_SENSITIVITY_CHANGE,
            executionStrategy: 'durable',
            params: {
                deviceId: "",
                sensitivityLevel: "" // used for changing SENSITIVITY_LEVEL
            }
        },
        {
            displayName: "Change Motion Alert Mode",
            eventName: EVENTS.TRIGGER_ALERT_MODE_CHANGE,
            executionStrategy: 'durable',
            params: {
                deviceId: "",
                alertMode: "" // used for changing ALERT_MODE
            }
        }
    ],

    "FACTS": [
        {
            factName: FACTS.MOTION_STATE,
            factValues: [MOTION_STATE.DETECTED, MOTION_STATE.NOT_DETECTED],
        },
        {
            factName: FACTS.SENSITIVITY,
            factValues: [SENSITIVITY_LEVELS.LOW, SENSITIVITY_LEVELS.MEDIUM, SENSITIVITY_LEVELS.HIGH],
        },
        {
            factName: FACTS.ALERT_MODE,
            factValues: [ALERT_MODES.SILENT, ALERT_MODES.NOTIFICATION, ALERT_MODES.ALARM],
        }
    ]
}
