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
      console.log("get rules res", rules)

      // for (let i = 0; i < rules.length; i++) {
      //   let rule = rules[i];

      //   rule["conditionSetIds"] = [];
      //   let conditions:any = []
      //   rule["conditionSetNames"] = [];
        
      //   for (const conditionSet of rule?.conditions) {
      //     //here condition are conditionSets
      //     //anyone condition of the conditionSet need to be true,
      //     //for it to be evaluated as true
      //     console.log("COONDition", conditionSet)
      //     conditions.push(conditionSet?.conditions)
      //     rule.conditionSetIds.push(conditionSet?.id)
      //     rule.conditionSetNames.push(conditionSet?.name)
      //   }
      //   rules[i] = rule;
      //   //my doubt is why are we aggregating all the conditions of the conditionSet ?
      //   rule.conditions = conditions;
      // }
      // console.log(`parsed rules = ${rules}`)
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
