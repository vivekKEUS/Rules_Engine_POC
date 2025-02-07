import type { Context } from "moleculer";
import type { IResponse } from "../../../types"
import { FACTS, ALERT_MODES } from "../constants";
export class GetMotionAlertMode{
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            // let applicance = await DeepmediaDeviceManagerClass.getDeepmediaDeviceManager().getAppliances(executeParams.id)
            
            //for now I getting a random state for the device between on/off
            let i = Math.random()
            let deviceMode = "null"
            if (i <= 0.33){
                deviceMode = ALERT_MODES.SILENT
            }else if(i <= 0.66){
                deviceMode = ALERT_MODES.NOTIFICATION
            }else{
                deviceMode = ALERT_MODES.ALARM
            }
            data[FACTS.ALERT_MODE] = deviceMode;

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
