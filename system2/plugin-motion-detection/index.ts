import Moleculer, { Context, Service, ServiceBroker, type ServiceSchema, type ServiceSettingSchema } from "moleculer";
import * as PluginConfig from "./config";
import { AsyncDelay, GetVersionStr } from "../../types";
import { GetFactsTriggerAction } from "./actions/get-facts-trigger";
import { GetMotionState } from "./actions/GetMotionState";
import { GetMotionSensitivity } from "./actions/GetMotionSensitivity";
import { GetMotionAlertMode } from "./actions/GetMotionAlertMode";
export class MotionService extends Service {
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
        GetFactsTrigger: GetFactsTriggerAction.handler,
        GetMotionState: GetMotionState.handler,
        GetMotionSensitivity: GetMotionSensitivity.handler,
        GetMotionAlertMode: GetMotionAlertMode.handler,
        ChangeMotionState: async (ctx: Context): Promise<any> => {
          await AsyncDelay(2000);
          console.log("Motion state changed", ctx.params);
          //@ts-ignore
          return { success: true, data: `Motion state changed to ${ctx.params.state}` };
        }
      },
      channels: {
        "p2.trigger-motion-state-change": {
          async handler(ctx: Context) {
            console.log(
              "------MOTION SERVICE RECEIVED A MESSAGE-----",
              ctx.params
            );
            // await AsyncDelay(2000);
          },
        },
        "p2.trigger-motion-sensitivity-change": {
          async handler(ctx: Context) {
            console.log(
              "------MOTION SENSITIVITY RECEIVED A MESSAGE-----",
              ctx.params
            );
            // await AsyncDelay(2000);
          },
        },
        "p2.trigger-motion-alert-mode-change": {
          async handler(ctx: Context) {
            console.log(
              "------MOTION ALERT MODE RECEIVED A MESSAGE-----",
              ctx
            );
            // await AsyncDelay(2000);
          },
        },
      },
    });
  }
}
