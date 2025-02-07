import type { Context } from "moleculer";
import type { IResponse } from "../../../types"
import { FACTS, SENSITIVITY_LEVELS } from "../constants";
export class GetMotionSensitivity {
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            let i = Math.random()
            let deviceSensitivity = "null"
            if (i <= 0.33){
                deviceSensitivity = SENSITIVITY_LEVELS.LOW
            }else if(i <= 0.66){
                deviceSensitivity = SENSITIVITY_LEVELS.MEDIUM
            }else{
                deviceSensitivity = SENSITIVITY_LEVELS.HIGH
            }
            data[FACTS.SENSITIVITY] = deviceSensitivity;

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

