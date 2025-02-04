import type { Context } from "moleculer";
import type { IResponse } from "../../types"
import { FACTS, MODES, POWER, SPEEDS } from "../constants";
export class GetFanSpeed {
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            let i = Math.random()
            let deviceSpeed = "null"
            if (i <= 0.33){
                deviceSpeed = SPEEDS.LOW
            }else if(i <= 0.66){
                deviceSpeed = SPEEDS.MEDIUM
            }else{
                deviceSpeed = SPEEDS.HIGH
            }
            data[FACTS.MODE] = deviceSpeed;

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

