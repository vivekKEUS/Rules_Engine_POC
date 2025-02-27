import Moleculer, { Context, Service, ServiceBroker } from "moleculer";
import * as PluginConfig from "./config";
import {
  RuleActionManager,
  RuleManager,
  RulesConditionManager,
} from "./actions/manage-rules";
import { RuleRegistry } from "./helpers/rules-engine-helper";
import { _RulesEngine } from "./rules-engine";
import type { IRoutineSet } from "./models/kiotp_rules_engine_model";
import { GetFactsTriggerAction } from "./actions/get-facts-triggers";
import { GetVersionStr } from "../types";
import { AsyncDelay } from "../types";
import { AddFacts } from "./models/kiotp_facts_triggers_discovery";
import { AddTriggers } from "./models/kiotp_facts_triggers_discovery";
import { executeRoutines, processDelay } from "../utils/processEvent";
export class PluginService extends Service {
  mongoFlag: boolean;
  constructor(broker: ServiceBroker) {
    super(broker);
    this.mongoFlag = true;
    this.parseServiceSchema({
      name: PluginConfig.NAME,
      version: GetVersionStr(PluginConfig.VERSION),
      meta: {
        scalable: false,
      },
      dependencies: [],
      settings: {
        upperCase: true,
      },
      actions: {
        GetPluginInfo: () => {
          return PluginConfig;
        },
        AddRule: RuleManager.AddRuleAction.handler,
        DeleteRule: RuleManager.RemoveRuleAction.handler,
        GetRules: RuleManager.GetRulesAction.handler,
        UpdateRule: RuleManager.UpdateRuleAction.handler,
        AddActionToRule: RuleActionManager.AddActionToRuleAction.handler,
        DeleteActionInRule:
          RuleActionManager.RemoveActionFromRuleAction.handler,
        UpdateActionInRule: RuleActionManager.UpdateActionInRuleAction.handler,
        GetActionsInRule: RuleActionManager.GetRuleActionsAction.handler,
        GetCoditionSetItems:
          RulesConditionManager.GetConditionSetAction.handler,
        AddConditionSet: RulesConditionManager.CreateConditionSet.handler,
        RemoveConditionSet: RulesConditionManager.RemoveConditionSet.handler,
        AddCondition: RulesConditionManager.AddConditionToConditionSet.handler,
        RemoveCondition:
          RulesConditionManager.RemoveConditionFromConditionSet.handler,
        UpdateCondition:
          RulesConditionManager.UpdateConditionInConditionSetAction.handler,
        AddAction: RuleActionManager.AddActionToRuleAction.handler,
        RemoveAction: RuleActionManager.RemoveActionFromRuleAction.handler,
        UpdateAction: RuleActionManager.UpdateActionInRuleAction.handler,
        GetFactsTrigger: GetFactsTriggerAction.handler,
        getMapping: RuleManager.GetMapping.handler,
        AddFacts: AddFacts,
        AddTriggers: AddTriggers,
        AsyncDelay: AsyncDelay,
      },
      methods: {
        processActions: async (routineSets: IRoutineSet[], metadata: Object) => {
          for (const routineSet of routineSets) {
            if (routineSet.delay) {
              processDelay(this.broker,routineSet.delay)
            }
            else if (routineSet.routines) {
              await executeRoutines(this.broker,routineSet.routines,metadata)
              broker.logger.info("[RulesEngine] Finished processing trigger set");
            }
          }
        },

        factChangeEventHandler: async (ctx: Moleculer.Context) => {
          console.info("[RulesEngine] Fact Change Detected");
          // if (!this.eventExecuted) {
            // this.eventExecuted = true
            try {
              let params = <{ id: string; facts: string[] }>ctx.params;
              console.info("[RulesEngine] Start a new rulesEngine");
              let _engine = new _RulesEngine();
              if("engine" in ctx.meta){
                console.error("[RulesEngine] Nested Rule detected, stopping the execution")
                return; //nested rule triggering
              }
              ctx.meta = {...ctx.meta, engine: 1}
              console.log("[FactChangeHandler] Context.Meta", ctx.meta)
              let engineResponse = await _engine.execute(ctx);
              if (engineResponse.events.length == 0) {
                console.info(
                  "[RulesEngine] No event occured due to current fact changes."
                );
              }
              engineResponse.events.forEach(async (event) => {
                console.info(
                  "[RulesEngine] Due to facts change, triggering event ",
                  event.type
                );
                await this.processActions(event.params as IRoutineSet[],ctx.meta); //typescript shenanigans
              });
            } catch (err) {
              console.info(
                "[RulesEngine] Error while processing fact change event",
                err
              );
            }
          // }else{
          //   console.log("[RulesEngine] Event already executed")
          //   this.eventExecuted = false
          // }
        },
      },
      events: {
        "facts.state.changed": (ctx: Moleculer.Context) => {
          console.info("forget-and-fire event");
          this.factChangeEventHandler(ctx);
        },
      },
      channels: {
        "p2.facts.state.changed": {
          group: `${this.broker.namespace}.${PluginConfig.NAME}.p2.facts.state.changed`,
          context: true, // Unless not enabled it globally
          async handler(ctx: Moleculer.Context) {
            // @ts-ignore
            let ruleHistory: Array<string> = ctx.meta.ruleHistory || [];
            console.log("[Channels] Context.Meta = ", ctx.meta)
            //@ts-ignore
            if (ruleHistory.includes(ctx.meta.ruleName)) {
              console.warn("Loop Detected! Already processed this event");
              return;
            }

            console.log(
              "[RulesEngine] Message received on channel p2.facts.state.changed"
            );
            console.log("Context.params=> ",ctx.params)
            //@ts-ignore
            this.factChangeEventHandler(ctx);
          },
        },
        
      },
      created: this.serviceCreated,
    });
  }
  async serviceCreated() {
    console.info(`${PluginConfig.NAME} Created`);
    RuleRegistry.init(this.broker);
  }
}
export { PluginConfig };
