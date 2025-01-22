import { Context } from "moleculer";
import * as RulesDbModels from "../../../models/kiotp_rules_engine_model";
import { _RulesManager } from "../../../helpers/rules-engine-helper";
import { GetMapping } from "./getMapping";

export namespace IUpdateRuleAction {
  export interface Request extends RulesDbModels.IRule {}

  export interface Response<Data = any> {
    success: boolean;
    error?: string;
    data?: Data;
  }
}

class UpdateRuleAction {
  static params = {};

  static hooks = {
    before(ctx: Context) {
      console.log("this is before", ctx.params);
    },
    after(ctx: Context, res: IUpdateRuleAction.Response) {
      console.log("this is after", ctx.params, res);

      return res;
    },
  };

  static async handler(ctx: Context): Promise<IUpdateRuleAction.Response> {
    console.log(ctx.params, ctx.id);
    try {
      let params = <IUpdateRuleAction.Request>ctx.params;

      if (!params.id)
        return {
          success: false,
          error: "rule.id is required to update the rule",
        };
      let rulesMapping : any = await GetMapping.handler(ctx);
      let newParams : any = Object.assign({}, params);
      let conditions = params.conditions.map(conditionSet => conditionSet.conditions)
      newParams.conditions = conditions
      let currentRuleMapping  : any = await GetMapping.extractSceneIdsFromRule(newParams);
      let isCircular = await GetMapping.isCircular(rulesMapping, currentRuleMapping)
      if(isCircular){
        return {
          success :  false,
          error : "Circular loop detected"
        }
      }
      let res = await RulesDbModels.RuleMethods.updateRule(params);
      
      if(res.success){
        _RulesManager.updateRules()
      }
      return res;
    } catch (err) {
      return {
        success: false,
        error: err?.toString(),
      };
    }
  }
}

export { UpdateRuleAction };
