import Moleculer, { Context, Service, ServiceBroker } from "moleculer";
import * as PluginConfig from "./config";
import {
  RuleActionManager,
  RuleManager,
  RulesConditionManager,
} from "./actions/manage-rules";
import { _RulesManager } from "./helpers/rules-engine-helper";
import { _RulesEngine } from "./rules-engine";
import type {tempDelayTrigger } from "./models/kiotp_rules_engine_model";
import { GetFactsTriggerAction } from "./actions/get-facts-triggers";
import { GetVersionStr } from "../types";
import { buildPayload, AsyncDelay } from "../types";
import { AddFacts } from "./models/kiotp_facts_triggers_discovery";
import { AddTriggers } from "./models/kiotp_facts_triggers_discovery";
import { getNewService } from "./actions/get-facts-triggers/getNewService";
export class RulesEngineService extends Service {
  mongoFlag: boolean;
  eventExecuted: boolean;
  constructor(broker: ServiceBroker) {
    super(broker);
    this.mongoFlag = true;
    this.eventExecuted = false;
    this.parseServiceSchema({
      name: PluginConfig.ID,
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
        ToggleRule: RuleManager.ToggleRuleAction.handler,
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
      },
      methods: {
        processActions: async (actions: tempDelayTrigger[]) => {
          for (const triggerSet of actions) {
            if (triggerSet.delay) {
              console.log(`-------- Delaying next set of triggers by ${triggerSet.delay} seconds`);
              await AsyncDelay(triggerSet.delay * 1000);
            }
            if (triggerSet.triggers) {
              console.log("Processing trigger set:", triggerSet);

              const triggerPromises: Promise<any>[] = triggerSet.triggers.map(async (trigger) => {
                try {
                  console.log("-------- Emitting Durable Event");
                  const payload = buildPayload(trigger.actionData.customActionData);
                  const actionPath = `1.0.0.${trigger.actionData.serviceId}.${trigger.actionData.emitTriggerAction}`;

                  console.log("Triggering action:", actionPath);
                  return broker.call(actionPath, payload);
                } catch (err) {
                  console.error("Failed to execute action:", trigger.actionData, err);
                }
              });
              await Promise.all(triggerPromises);
              console.log("Finished processing trigger set");
            }
          }
        },
        factChangeEventHandler: async (ctx: Moleculer.Context) => {
          console.log("----FACTS CHANGED EVENT HANDLER-------");
          try {
            let params = <{ id: string; facts: string[] }>ctx.params;
            let _engine = new _RulesEngine();
            let engineResponse = await _engine.execute(params);

            if (engineResponse.events.length == 0) {
              console.log("--------NO EVENTS MATCHED THE STATE----------");
            }

            engineResponse.events.forEach((event) => {
              console.log(
                "----EVENT MATCHED THE STATE CHANGE---",
                event.type
              );
              if (!event.params?.actions) {
                return;
              }
              this.processActions(event.params.actions);
            });
          } catch (err) {
            console.log("error while processing fact change event", err);
          }
        },
      },
      events: {
        "facts.state.changed": (ctx: Moleculer.Context) => {
          console.log("forget-and-fire event")
          this.factChangeEventHandler(ctx);
        },
      },
      channels: {
        "p2.facts.state.changed": {
          group: `${this.broker.namespace}.${PluginConfig.ID}.p2.facts.state.changed`,
          context: true, // Unless not enabled it globally
          async handler(ctx: Moleculer.Context) {
            //@ts-ignore
            if (!this.eventExecuted) {
              console.log("------RULES ENGINE CHANNEL RECIEVED A MESSAGE-----");
              //@ts-ignore
              this.factChangeEventHandler(ctx);
              //@ts-ignore
              this.eventExecuted = true;
            }
          },
        },
        "p2.new.service.added": {
          async handler(ctx: Context) {
              console.log("------NEW SERVICE ADDED-----", ctx.params);
              //@ts-ignore
              AddFacts(ctx.params.ServiceId, ctx.params.ServiceVersion, ctx.params.FactName, ctx.params.FactValue);
              //@ts-ignore
              AddTriggers(ctx.params.ServiceId, ctx.params.ServiceVersion, ctx.params.TriggerName, ctx.params.TriggerAction, ctx.params.TriggerValue);
          },
      },
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async serviceCreated() {
    this.logger.info(`${PluginConfig.NAME} Created`);
    console.log("RULES DB STARTED");
    _RulesManager.init(this.broker);
    // let siteBroker = await startBridge(this.broker)
  }

  async serviceStarted() {
    this.logger.info(`${PluginConfig.NAME} Started`);
    console.log("Service Started for Rules Engine")
    let ctx = Context.create(this.broker);
    console.log(ctx)
    await getNewService(this.broker);
    setInterval(()=>getNewService(this.broker), 30000) //30 seconds
  }
  serviceStopped() {
    this.logger.info(`${PluginConfig.NAME} Stopped`);
  }
}
export { PluginConfig };