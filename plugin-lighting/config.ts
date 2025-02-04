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

export const ID = 'kiotp.plugins.general.lighting';
export const NAME = "PLUGIN_LIGHT"
export const DISPLAY_NAME = 'LIGHT SERVICE';
export const DESCRIPTION = `Light Service is responsible for starting fans, scheduling fan automations and listening for new events regarding fan movement`;
export const VERSION = {
    MAJOR: 1,
    MINOR: 0,
    PATCH: 0
};
export const TYPE = PluginTypes.GENERAL_PLUGIN;

export const CATEGORY = ["general"];

export const PLUGIN_CATEGORY = ["light_service"]

export const IMAGES = {
    service: '816687511673.dkr.ecr.ap-south-1.amazonaws.com/keus-iot-platform/gateway-node-manager:latest'
};

