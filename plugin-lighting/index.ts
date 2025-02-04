import Moleculer, {Context, Service,ServiceBroker, type ServiceSchema, type ServiceSettingSchema } from "moleculer";
import * as PluginConfig from "./config"
import { GetVersionStr } from "../types";
import { GetFactsTriggerAction } from "./actions/get-facts-trigger";
import { GetFanState } from "./actions/GetLightState";
import { GetFanSpeed } from "./actions/GetLightColor";
import { GetFanMode } from "./actions/GetLightBrightness";
export class FanService extends Service{
    static broker: ServiceBroker
    constructor(_broker : ServiceBroker){
        super(_broker)
        this.broker = _broker;
        this.parseServiceSchema({
            name: PluginConfig.ID,
            version: GetVersionStr(PluginConfig.VERSION),
            settings: {},
            dependencies: [],
            actions:{
                GetPluginInfo: () =>{
                    return PluginConfig
                },
                GetFactsTriggerAction: GetFactsTriggerAction.handler,
                GetFanState: GetFanState.handler,
                GetFanSpeed: GetFanSpeed.handler,
                GetFanMode: GetFanMode.handler,
            },
            channels: {
                "p2.trigger-fan-state-change": {
                  async handler(ctx:Context) {
                    console.log(
                      "------FAN SERVICE RECIEVED A MESSAGE-----",
                      ctx.params
                    );
                  },
                },
                "p2.trigger-fan-speed-change": {
                  async handler(ctx: Context) {
                    console.log(
                      "------FAN SPEED RECIEVED A MESSAGE-----",
                      ctx.params
                    );
                    //@ts-ignore
                    // DeepMediaSceneActions.ExecuteSceneAction.handler(ctx);
                  },
                },
                "p2.trigger-fan-mode-change": {
                  async handler(ctx: Context) {
                    console.log(
                      "------FAN MODE RECIEVED A MESSAGE-----",
                      ctx
                    );
                    //@ts-ignore
                    // DeepMediaSceneActions.ExecuteSceneAction.handler(ctx);
                  },
                },
              },
        });
    }
}