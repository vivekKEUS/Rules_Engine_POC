import { Context } from "moleculer";
import * as RulesDbModels from "../../../models/kiotp_rules_engine_model";
import { _RulesManager } from "../../../helpers/rules-engine-helper";
import { GetMapping } from "./getMapping";
import mongoose from "mongoose";
import type { IRule } from "../../../models/kiotp_rules_engine_model";
import { pbkdf2 } from "crypto";
export namespace IAddRuleAction {
  export interface Request extends RulesDbModels.IRule {
    name: string;
    description: string;
  }

  export interface Response<Data = any> {
    success: boolean;
    error?: string;
    data?: Data;
  }
}

class AddRuleAction {
  static params = {};

  static hooks = {
    before(ctx: Context) {
      console.log("this is before", ctx.params);
    },
    after(ctx: Context, res: IAddRuleAction.Response) {
      console.log("this is after", ctx.params, res);

      return res;
    },
  };

  static async handler(ctx: Context): Promise<IAddRuleAction.Response> {
    console.log(ctx.params, ctx.id);
    try {
      let params = <IAddRuleAction.Request>ctx.params;

      if (!params.name)
        return {
          success: false,
          error: "rule.name is required to create rule",
        };

      params.id = new mongoose.Types.ObjectId().toString();

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

      // //loop to emit persistence or one-time event for each action which is to be executed
      // //here action and routines are same
      // for(let i = 0; i < params.event.params.actions.length; i++){
      //   let action = params.event.params.actions[i]
      //   if(action.strategy == "durable"){
      //     // console.log(ctx.broker.sendToStream)
      //     await ctx.broker.sendToChannel("p2.facts.state.changed",action);
      //   }else{
      //     await ctx.broker.emit("facts.state.changed",action); //forget and fire event
      //   }
      // }

      console.log("trying to insert data in mongo")  
      let addRes = await RulesDbModels.RuleMethods.addRule(params);

      if(addRes.success){
        console.log("new rule inserted in mongo")
        _RulesManager.updateRules()
      }else{
        console.log("failed to insert rule in mongo")
        console.log(addRes.error)
      }
      return addRes;
    } catch (err) {
      console.log("error while adding rule", err)
      return {
        success: false,
        error: err?.toString(),
      };
    }
  }
}

export { AddRuleAction };
