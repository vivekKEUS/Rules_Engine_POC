export enum FACTS {
    FAN_STATE = "fan-power-state",
    SPEED = "fan-speed-change",
    MODE = "fan-mode-change"
}

export enum EVENTS {
    TRIGGER_FAN_STATE_CHANGE = "p2.trigger-fan-state-change",
    TRIGGER_FAN_SPEED_CHANGE = "p2.trigger-fan-speed-change",
    TRIGGER_FAN_MODE_CHANGE = "p2.trigger-fan-mode-change"
}

export enum Triggers {
    POWER_STATE = "p2.fan-power-state",
    SPEED = "p2.fan-speed-change",
    MODE = "p2.fan-mode-change"
}

export const POWER = ["on", "off"];
export const SPEEDS = ["low", "medium", "high"];
export const MODES = ["normal", "sleep", "turbo"];