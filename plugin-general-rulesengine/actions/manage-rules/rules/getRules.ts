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
      let rules = (await RulesDbModels.RuleMethods.getRules()).data;

      // console.log("get rules res", rules)

      for (let i = 0; i < rules.length; i++) {
        let rule = rules[i];

        rule["conditionIds"] = [];
        let conditions:any = []
        rule["conditionSetNames"] = [];
        
        for (const condition of rule?.conditions) {
          conditions.push(condition?.conditions)
          rule.conditionIds.push(condition?.id)
          rule.conditionSetNames.push(condition?.name)
        }
        rules[i] = rule;
        rule.conditions = conditions;
      }

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
