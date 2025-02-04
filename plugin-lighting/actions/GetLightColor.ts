import type { Context } from "moleculer";
import type { IResponse } from "../../types"
import { FACTS, COLORS} from "../constants";
export class GetLightColor {
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            let i = Math.random()
            let deviceColor = ""
            if (i <= 0.33){
                deviceColor = COLORS.BLUE
            }else if(i <= 0.66){
                deviceColor = COLORS.RED
            }else{
                deviceColor = COLORS.GREEN
            }
            data[FACTS.BULB_COLOR] = deviceColor

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

