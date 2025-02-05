import Moleculer, { Context, Service, ServiceBroker, type ServiceSchema, type ServiceSettingSchema } from "moleculer";
import * as PluginConfig from "./config"
import { AsyncDelay, GetVersionStr } from "../types";
import { GetFactsTriggerAction } from "./actions/get-facts-trigger";
import { GetFanState } from "./actions/GetFanState";
import { GetFanSpeed } from "./actions/GetFanSpeed";
import { GetFanMode } from "./actions/GetFanMode";
export class FanService extends Service {
  static broker: ServiceBroker
  constructor(_broker: ServiceBroker) {
    super(_broker)
    this.broker = _broker;
    this.parseServiceSchema({
      name: PluginConfig.ID,
      version: GetVersionStr(PluginConfig.VERSION),
      settings: {},
      dependencies: [],
      actions: {
        GetPluginInfo: () => {
          return PluginConfig
        },
        GetFactsTrigger: GetFactsTriggerAction.handler,
        GetFanState: GetFanState.handler,
        GetFanSpeed: GetFanSpeed.handler,
        GetFanMode: GetFanMode.handler,
        ChangeFanState: async (ctx: Context):Promise<any> => {
          await AsyncDelay(2000)
          console.log("Fan state changed",ctx.params);
          //@ts-ignore
          return {success: true, data: `Fan is turned ctx.params.state`}
        }
      },
      channels: {
        "p2.trigger-fan-state-change": {
          async handler(ctx: Context) {
            console.log(
              "------FAN SERVICE RECIEVED A MESSAGE-----",
              ctx.params
            );
            // await AsyncDelay(2000);
          },
        },
        "p2.trigger-fan-speed-change": {
          async handler(ctx: Context) {
            console.log(
              "------FAN SPEED RECIEVED A MESSAGE-----",
              ctx.params
            );
            // await AsyncDelay(2000);
          },
        },
        "p2.trigger-fan-mode-change": {
          async handler(ctx: Context) {
            console.log(
              "------FAN MODE RECIEVED A MESSAGE-----",
              ctx
            );
            // await AsyncDelay(2000);
          },
        },
      },
    });
  }
}