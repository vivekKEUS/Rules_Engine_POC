export enum FACTS{
    BULB_STATE = "bulb-power-state",
    BRIGHTNESS = "bulb-brightness-change",
    BULB_COLOR = "bulb-color-change"
}

export enum EVENTS{
    TRIGGER_BULB_STATE_CHANGE = "p2.trigger-bulb-state-change",
    TRIGGER_BULB_BRIGHTNESS_CHANGE = "p2.trigger-bulb-brightness-change",
    TRIGGER_BULB_COLOR_CHANGE = "p2.trigger-bulb-color-change",
}
export enum Triggers{
    POWER_STATE = "p2.bulb-power-state",
    BRIGHTNESS = "p2.bulb-brightness-change",
    COLOR = "p2.bulb-color-change"
}
export const POWER = ["on", "off"]
export const BRIGHTNESS = ["low", "medium", "high"]
export const COLORS = ["red", "green", "blue"]

// export const FACTS_AND_TRIGGERS = {
//     FACTS : [
//         {
//             id: FACTS.PLAYING_STATE,   //factname
//             TYPE: IPluginConfig.TriggerType.STRING,
//             fetchState: "GetPlayFactState",
//             displayName: "When content is ", //play and pause
//             value : "playing",
//             categories : ["DEVICE"]
//         }
//     ],
//     TRIGGERS: [
        
//     ]
// }