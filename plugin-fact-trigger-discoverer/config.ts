enum PluginTypes {
    CORE_PLUGIN = "CORE_PLUGIN",
    DEVICE_PLUGIN = "DEVICE_PLUGIN",
    GENERAL_PLUGIN = "GENERAL_PLUGIN",
    AGGREGATOR_PLUGIN = "AGGREGATOR_PLUGIN"
}
export const ID = 'kiotp.plugins.discovery.facts.tigger';
export const NAME = "PLUGIN_FACTS_DISCOVERY"
export const DISPLAY_NAME = 'FACTS DISCOVERY SERVICE';
export const DESCRIPTION = `Facts Discovery Service is responsible for discovering facts and triggers for new service that are added to the app`;
export const VERSION = {
    MAJOR: 1,
    MINOR: 0,
    PATCH: 0
};
export const TYPE = PluginTypes.AGGREGATOR_PLUGIN;

export const CATEGORY = ["discovery"];

