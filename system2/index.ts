 import { ServiceBroker } from "moleculer";
import { v4 as uuidv4 } from 'uuid';
import { brokerConfig } from "./moleculer.config";
import { AsyncDelay } from "../types";
import { MotionService } from "./plugin-motion-detection";

const broker = new ServiceBroker(brokerConfig);

broker.createService(MotionService)
broker.start()
    .then(async () => {
        console.log("Broker of system 2 started successfully");
    })
    .catch((err) => {
        console.error("Error starting broker:", err);
    });


