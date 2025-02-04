import type { Context } from "moleculer";
import type { IResponse } from "../../types"
import { FACTS, BRIGHTNESS} from "../constants";
export class GetLightBrightness{
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            // let applicance = await DeepmediaDeviceManagerClass.getDeepmediaDeviceManager().getAppliances(executeParams.id)
            
            //for now I getting a random state for the device between on/off
            let i = Math.random()
            let deviceBrightness = "null"
            if (i <= 0.33){
                deviceBrightness = BRIGHTNESS.LOW
            }else if(i <= 0.66){
                deviceBrightness = BRIGHTNESS.MEDIUM
            }else{
                deviceBrightness = BRIGHTNESS.HIGH
            }
            data[FACTS.BRIGHTNESS] = deviceBrightness;

            return {
                success: true,
                data: data
            }
        } catch (err) {
            console.error(err);
            return {
                success: false,
                error: err?.toString()
            }
        }
    }
}
