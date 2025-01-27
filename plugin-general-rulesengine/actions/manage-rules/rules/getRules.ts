import { Context } from "moleculer";
import * as RulesDbModels from "../../../models/kiotp_rules_engine_model";

export namespace IGetRulesAction {
  export interface Request {}

  export interface Response<Data = any> {
    success: boolean;
    error?: string;
    data?: Data;
  }
}

class GetRulesAction {
  static params = {};

  static hooks = {
    before(ctx: Context) {
      console.log("this is before", ctx.params);
    },
    after(ctx: Context, res: IGetRulesAction.Response) {
      console.log("this is after", ctx.params, res);

      return res;
    },
  };

  static async handler(): Promise<IGetRulesAction.Response> {
    try {
      let rules = (await RulesDbModels.RuleMethods.getRules()).data; //gives out an array as output
      // console.log("get rules res", rules)
      // let Rules:Array<RulesDbModels.IRule> = [];
      // for (const temp of rules){
      //   const newRule : RulesDbModels.IRule;
      //   newRule.id
      // }
      return { success: true, data: rules };
    } catch (err) {
      return {
        success: false,
        error: err?.toString(),
      };
    }
  }
}

export { GetRulesAction };
