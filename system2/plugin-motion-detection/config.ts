enum PluginTypes {
    CORE_PLUGIN = "CORE_PLUGIN",
    DEVICE_PLUGIN = "DEVICE_PLUGIN",
    GENERAL_PLUGIN = "GENERAL_PLUGIN",
    AGGREGATOR_PLUGIN = "AGGREGATOR_PLUGIN"
}
export declare enum ApplianceType {
    CONTENT = "CONTENT",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    DISPLAY = "DISPLAY",
    SYSTEM = "SYSTEM"
}

export const ID = 'kiotp.plugins.device.motion.detector';
export const NAME = "PLUGIN_MOTION_DETECTION";
export const DISPLAY_NAME = 'Motion Detection';
export const DESCRIPTION = "This plugin is used to detect motion in the room";
export const VERSION = {
    MAJOR: 1,
    MINOR: 0,
    PATCH: 0
};
export const TYPE = PluginTypes.GENERAL_PLUGIN;

export const CATEGORY = [PluginTypes.GENERAL_PLUGIN];

export const PLUGIN_CATEGORY = ["motion_detection_service"]

export const IMAGES = {
    service: '816687511673.dkr.ecr.ap-south-1.amazonaws.com/keus-iot-platform/gateway-node-manager:latest'
};
