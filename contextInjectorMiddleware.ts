import { ServiceBroker } from "moleculer";

/**
 * Middleware to automatically inject context into sendToChannel calls
 * when context is not explicitly provided.
 */
export const contextInjectorMiddleware = () => {
  return {
    name: "ContextInjectorMiddleware",
    
    created(broker: ServiceBroker) {
      const originalSendToStream = broker.sendToChannel;
      
      if (!originalSendToStream) {
        broker.logger.warn("ContextInjector: sendToChannel method not found on broker. Make sure this middleware is registered before the channels middleware.");
        return;
      }
      
      broker.sendToChannel = function(
        action: string, 
        params: Record<string, any> = {}, 
        options: Record<string, any> = {}
      ) {
        if (!options.ctx) {
          try {
            // Create a new context with proper parameters
            options.ctx = {meta: options}
          } catch (error) {
            broker.logger.warn(`[ContextInjector] Failed to create context: ${error}`);
          }
        }
        
        return originalSendToStream.call(this, action, params, options);
      };
    }
  };
};
