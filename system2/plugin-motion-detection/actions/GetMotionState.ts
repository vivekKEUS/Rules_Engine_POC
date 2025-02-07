import type { Context } from "moleculer";
import type { IResponse } from "../../../types"
import { FACTS, MOTION_STATE } from "../constants";
export class GetMotionState {
    static async handler(ctx: Context): Promise<IResponse> {
        try {
            //get the deviceID from ctx.params
            let data: Record<string, any> = {}
            let i = Math.random()
            let deviceState = "null"
            if (i <= 0.5){
                deviceState = MOTION_STATE.DETECTED
            }else{
                deviceState = MOTION_STATE.NOT_DETECTED
            }
            data[FACTS.MOTION_STATE] = deviceState;

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