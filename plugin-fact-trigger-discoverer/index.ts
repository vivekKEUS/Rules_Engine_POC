import Moleculer, { Context, Service, ServiceBroker, type ServiceSchema } from "moleculer";
import * as PluginConfig from "./config";
import { GetVersionStr } from "../types";
import { AddFacts, AddTriggers, GetFacts, GetTriggers } from "./model";
import type { IResponse } from "../plugin-general-rulesengine/models/kiotp_rules_engine_model";

export class FactsDiscoveryService extends Service {
    static broker: ServiceBroker;

    constructor(_broker: ServiceBroker) {
        super(_broker);
        this.broker = _broker;
        this.parseServiceSchema({
            name: PluginConfig.ID,
            version: GetVersionStr(PluginConfig.VERSION),
            settings: {},
            dependencies: [],
            actions: {
                GetPluginInfo: () => {
                    return PluginConfig;
                },
                GetFacts: GetFacts,
                GetTriggers: GetTriggers,
                AddFacts: AddFacts,
                AddTriggers: AddTriggers
            },
            channels: {
                "p2.new.service.added": {
                    async handler(ctx: Context) {
                        console.log("------NEW SERVICE ADDED-----", ctx.params);
                        //@ts-ignore
                        AddFacts(ctx.params.ServiceId, ctx.params.ServiceVersion, ctx.params.FactName, ctx.params.FactValue);
                        //@ts-ignore
                        AddTriggers(ctx.params.ServiceId, ctx.params.ServiceVersion, ctx.params.TriggerName, ctx.params.TriggerAction, ctx.params.TriggerValue);
                    },
                },
            },
            started: this.ServiceStarted
        });
    }

    async ServiceStarted() {
        try {
            // Wait for the "$node" service to be available
            await this.broker.waitForServices("$node");

            // Retrieve all services from the broker
            let allServices = await this.broker.call("$node.services");
            //@ts-ignore
            allServices = allServices
                .map((service: ServiceSchema) => ({
                    name: service.name,
                    version: service.version,
                    fullName: service.fullName,
                }));

            console.log("All available services", allServices);

            //@ts-ignore
            for (const service of allServices) {
                const actionString = `${service.version}.${service.name}.GetFactsTrigger`;
                const action = this.broker.registry.actions.get(actionString);

                if (action) {
                    // Call the GetFactsTrigger action
                    const resp: IResponse = await this.broker.call(actionString);
                    if (resp.success) {
                        const FACTS_AND_TRIGGERS = resp.data;
                        console.log("FACTS_AND_TRIGGERS", FACTS_AND_TRIGGERS);

                        // If there are triggers, add them
                        if (FACTS_AND_TRIGGERS.TRIGGERS) {
                            FACTS_AND_TRIGGERS.TRIGGERS.forEach((trigger: any) => {
                                AddTriggers(
                                    service.name,
                                    service.version,
                                    trigger.eventName,
                                    trigger.executionStrategy,
                                    trigger.params
                                );
                            });
                        }
                        if (FACTS_AND_TRIGGERS.FACTS) {
                            FACTS_AND_TRIGGERS.FACTS.forEach((fact: any) => {
                                AddFacts(
                                    service.name,
                                    service.version,
                                    fact.factName,
                                    fact.factValues,
                                );
                            });
                        }
                    }
                }else{
                    console.log("Action not found", actionString);
                }
            }
        } catch (error) {
            console.error("Error during service startup:", error);
        }
    }
}
