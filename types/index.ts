export declare enum PluginTypes {
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
export declare namespace IPluginConfig {
    interface IPluginConfigData {
        ID: string;
        NAME: string;
        DISPLAY_NAME: string;
        DESCRIPTION: string;
        VERSION: {
            MAJOR: number;
            MINOR: number;
            PATCH: number;
        };
        TYPE: PluginTypes;
        IMAGES: {
            SERVICE: string;
            CONTAINER_CONFIG?: {
                allowHostNetwork: boolean;
            };
        };
        PLUGIN_CATEGORY?: string[];
        CATEGORY?: string[];
    }
    enum TriggerType {
        INT = "int",
        BOOL = "bool",
        STRING = "string"
    }
}
