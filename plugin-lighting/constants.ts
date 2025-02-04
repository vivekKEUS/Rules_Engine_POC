export enum FACTS {
    BULB_STATE = "bulb-power-state",
    BRIGHTNESS = "bulb-brightness-change",
    BULB_COLOR = "bulb-color-change"
}

export enum EVENTS {
    TRIGGER_BULB_STATE_CHANGE = "p2.trigger-bulb-state-change",
    TRIGGER_BULB_BRIGHTNESS_CHANGE = "p2.trigger-bulb-brightness-change",
    TRIGGER_BULB_COLOR_CHANGE = "p2.trigger-bulb-color-change",
}

export enum Triggers {
    POWER_STATE = "p2.bulb-power-state",
    BRIGHTNESS = "p2.bulb-brightness-change",
    COLOR = "p2.bulb-color-change"
}

export enum POWER {
    ON = "on",
    OFF = "off"
}

export enum BRIGHTNESS {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}

export enum COLORS {
    RED = "red",
    GREEN = "green",
    BLUE = "blue"
}


export const FACTS_AND_TRIGGERS = [
    {
        TRIGGERS: [
            {
                displayName: "Change Bulb Power State",
                eventName: EVENTS.TRIGGER_BULB_STATE_CHANGE, // Event Name
                executionStrategy: 'durable', // 'durable' or 'fireAndForget'
                params: {
                    deviceId: "",
                    powerState: POWER, // for changing BULB_STATE
                }
            },
            {
                displayName: "Change Bulb Brightness",
                eventName: EVENTS.TRIGGER_BULB_BRIGHTNESS_CHANGE, // Event Name
                executionStrategy: 'durable',
                params: {
                    deviceId: "",
                    brightnessLevel: BRIGHTNESS, // used for changing BRIGHTNESS
                }
            },
            {
                displayName: "Change Bulb Color",
                eventName: EVENTS.TRIGGER_BULB_COLOR_CHANGE, // Event Name
                executionStrategy: 'durable',
                params: {
                    deviceId: "",
                    colorName: COLORS, // used for changing BULB_COLOR
                }
            }
        ],
    },
    {
        FACTS: [
            FACTS.BULB_STATE,
            FACTS.BRIGHTNESS,
            FACTS.BULB_COLOR
        ]
    }
];
