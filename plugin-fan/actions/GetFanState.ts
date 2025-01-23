import type { Context } from "moleculer";
import type { IResponse } from "../../types"
import { FACTS, POWER } from "../constants";
export class GetFanState {
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            // let applicance = await DeepmediaDeviceManagerClass.getDeepmediaDeviceManager().getAppliances(executeParams.id)
            
            //for now I getting a random state for the device between on/off
            let i = Math.random()
            let deviceState = "null"
            if (i <= 0.5){
                deviceState = POWER.ON
            }else{
                deviceState = POWER.OFF
            }
            data[FACTS.FAN_STATE] = deviceState;

            return {
                success: true,
                data: data
            }
        } catch (err) {
            console.log(err);
            return {
                success: false,
                error: err?.toString()
            }
        }
    }
}