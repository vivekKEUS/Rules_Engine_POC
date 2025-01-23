import { Service, ServiceBroker } from "moleculer";

export class LightingService extends Service {
    constructor(broker: ServiceBroker) {
        super(broker);
    }
}