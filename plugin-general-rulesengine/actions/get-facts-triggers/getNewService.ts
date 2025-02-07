import type { Context, ServiceBroker, ServiceSchema } from "moleculer";
import type { IResponse } from "../../../types";
import { AddFacts, AddTriggers } from "../../models/kiotp_facts_triggers_discovery";

export interface IFactsAndTriggers {
    TRIGGERS: {
        displayName: string;
        eventName: string;
        executionStrategy: string;
        params: any[];
    }[],
    FACTS: {
        factName: string;
        factValues: string[];
    }[]
}
export const fetchAllServices = async (broker: ServiceBroker): Promise<ServiceSchema[] | undefined> => {
    try {
        await broker.waitForServices("$node");
        const allServices = await broker.call("$node.services") as ServiceSchema[];
        return allServices;
    } catch (error) {
        console.error("Error during service startup:", error);
    }
}
const addFactsAndTriggers = async (service: ServiceSchema, FACTS_AND_TRIGGERS: IFactsAndTriggers) => {
    if (FACTS_AND_TRIGGERS.TRIGGERS) {
        FACTS_AND_TRIGGERS.TRIGGERS.forEach((trigger) => {
            AddTriggers(
                service.name,
                service.version?.toString() || "",
                trigger.eventName,
                trigger.executionStrategy,
                trigger.params
            );
        });
    }
    if (FACTS_AND_TRIGGERS.FACTS) {
        FACTS_AND_TRIGGERS.FACTS.forEach((fact) => {
            AddFacts(
                service.name,
                service.version?.toString() || "",
                fact.factName,
                fact.factValues
            );
        });
    }
}
export const getNewService = async (broker:ServiceBroker): Promise<void> => {
    const existingServices = new Set<string>();

    try {
        await broker.waitForServices("$node");

        const allServices = await fetchAllServices(broker);
        if (!allServices) {
            console.error("No services found");
            return;
        }

        const transformedServices = allServices.map(service => ({
            name: service.name,
            version: service.version,
            fullName: service.fullName,
        }));

        for (const service of transformedServices) {
            if (existingServices.has(service.fullName)) {
                continue;
            }
            existingServices.add(service.fullName);
            const actionString = `${service.version}.${service.name}.GetFactsTrigger`;
            const action = broker.registry.actions.get(actionString);
            if (!action) {
                console.warn("Action not found:", actionString);
                continue;
            }
            const resp: IResponse = await broker.call(actionString);
            if (resp?.success) {
                const FACTS_AND_TRIGGERS = resp.data as IFactsAndTriggers;
                console.log("FACTS_AND_TRIGGERS", FACTS_AND_TRIGGERS);
                await addFactsAndTriggers(service, FACTS_AND_TRIGGERS);
            }
        }
    } catch (error) {
        console.error("Error during service startup:", error);
    }
}