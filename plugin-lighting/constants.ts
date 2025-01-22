import { IPluginConfig } from "../types"
export enum FACTS{
    PLAYING_STATE = "lgtv-playing-state",
    VOLUME = "lgtv-volume-change"
}

export enum EVENTS{
    TRIGGER_BULB_STATE_CHANGE = "p2.trigger-bulb-state-change",
    TRIGGER_BULB_BRIGHTNESS_CHANGE = "p2.trigger-bulb-brightness-change",
    TRIGGER_BULB_COLOR_CHANGE = "p2.trigger-bulb-color-change",
}

export enum Triggers{
    PLAYING_STATE = "p1.lgtv-playing-state",
    VOLUME = "p1.lgtv-volume-change"
}

export const PLAYING_STATE = ["playing", "paused"]


export const FACTS_AND_TRIGGERS = {
    FACTS : [
        {
            id: FACTS.PLAYING_STATE,   //factname
            TYPE: IPluginConfig.TriggerType.STRING,
            fetchState: "GetPlayFactState",
            displayName: "When content is ", //play and pause
            value : "playing",
            categories : ["DEVICE"]
        }
    ],
    TRIGGERS: [
        
    ]
}