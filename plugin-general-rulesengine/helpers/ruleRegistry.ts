import { Almanac, Engine } from "json-rules-engine";
import type {
  AllConditions,
  NestedCondition,
  RuleProperties,
} from "json-rules-engine";
import * as RuleModels from "../models/kiotp_rules_engine_model";
import { GetRulesAction } from "../actions/manage-rules/rules";
import { ServiceBroker } from "moleculer";
import { ru } from "@faker-js/faker";

type TRule = RuleModels.IRule;
class RuleRegistry {
  private static rulesMap: Map<string, Rule> = new Map(); //mapping of rule name to rule
  public static broker: ServiceBroker;

  public static init(broker: ServiceBroker) {
    this.broker = broker;
    console.log("[RuleRegistry] initialized with node-id:", broker.nodeID);
    this.updateRules();
  }

  /**
   * @description create a new instance of ruleMap with current available rules 
   */
  public static async updateRules() {
    try {
      console.log("[RuleRegistry] Fetching all rules...");
      const rulesResponse = await GetRulesAction.handler();
      if (!rulesResponse?.success) {
        console.error(
          "[RuleRegistry] Failed to fetch rules:",
          rulesResponse?.error
        );
        return;
      }
      this.rulesMap.clear();
      const rules = rulesResponse.data as TRule[];

      rules.forEach((rule) => {
        if (!rule.enabled) {
          console.log(
            `[RuleRegistry] Rule ${rule.name} is disabled. Skipping...`
          );
          return;
        }
        console.log(`[RuleRegistry] adding Rule: ${rule.name} into HashMap`);
        this.rulesMap.set(rule.name, new Rule(rule));
      });
      console.log(
        `[RuleRegistry] Rules updated. Total rules: ${this.rulesMap.size}`
      );
    } catch (error) {
      console.error("[RuleRegistry] Failed to update rules map:", error);
    }
  }
  
  static getDependentRulesOfFacts(facts: Array<string>):Set<TRule> {
    const dependentRules= new Set<TRule>();
    console.log(
      `[RuleRegistry] Checking dependent rules for facts: ${JSON.stringify(
        facts
      )}`
    );
    for (const [ruleName,rule] of this.rulesMap.entries()) {
      if (!rule) {
        continue;
      }
      let listsOfFactNames = rule.getFacts();
      console.log(
        `[RuleRegistry] Checking rule ${
          rule.getName()
        } with facts: ${JSON.stringify([...listsOfFactNames])}`
      );

      for (const fact of facts) {
        if (listsOfFactNames.in(fact)) {
          console.log(
            `[RuleRegistry] Fact ${fact} matches rule ${rule.getName()}`
          );
          dependentRules.add(rule.rule);
          break;
        }
      }
    }
    console.log(`[RuleRegistry] Found ${dependentRules.size} dependent rules.`);
    return dependentRules;
  }

  static addRulesAndUpdateFactsState(engine: Engine, rules: Set<TRule>) {
    for (const i of rules) {
      let rule = this.rulesMap.get(i.name);
      if (!rule) {
        console.warn(`[RuleRegistry] Rule ${i.name} not found in rules map.`);
        continue;
      }
      rule.updateFacts(engine);
      let ruleProps = rule.getRuleProperties();
      console.log("[RuleRegistry] Adding rule to engine: ", ruleProps);
      engine.addRule(ruleProps);
    }
  }
}
class Rule {
  private rule: TRule;
  private ruleProperties: RuleProperties;
  private facts: Map<string,Record<any,any>> = new Map(); //store facts with their params, params are used in calculating the present value of fact

  constructor(rule: TRule) {
    this.rule = rule;
    this.ruleProperties = this.createRuleProperties();
    this.buildConditions();
    console.log(`[Rule ${rule.name}] Initialized.`);
  }

  private createRuleProperties(): RuleProperties {
    return { conditions: { all: [] }, event: this.rule.event };
  }

  public getRuleProperties(): RuleProperties {
    return this.ruleProperties;
  }

  public getRuleData(): TRule {
    return this.rule;
  }

  public getName(): string {
    return this.rule.name;
  }

  public hasFact(fact: string): boolean {
    return this.factSet.has(fact);
  }
  public getFacts():string[]{
    return this.factSet
  }

  private buildConditions() {
    if (!this.rule.conditionSets) return;
    
    for (const conditionSet of this.rule.conditionSets) {
      const nestedCondition: NestedCondition = { any: [] };
      for (const condition of conditionSet.conditions) {
        if (!condition.factName || !condition.operation) {
          console.error(`[Rule ${this.rule.name}] Invalid condition`);
          continue;
        }
        nestedCondition.any.push(this.formFactCondition(condition));
        this.factSet.add(condition.factName);
      }
      (this.ruleProperties.conditions as AllConditions).all.push(nestedCondition);
    }
  }

  private formFactCondition(condition: RuleModels.ICondition): NestedCondition {
    return {
      fact: condition.factName.split(".")[0],
      operator: condition.operation,
      value: condition.factValue,
      priority: condition.priority || 1,
      name: condition.name || "",
      params: { ...condition.params },
      path: condition.factPath || condition.factName,
    };
  }

  public updateFacts(engine: Engine) {
    for (const fact of this.factSet) {
      this.updateFactState(engine, fact);
    }
  }

  private async updateFactState(engine: Engine, fact: string, params: Record<any,any>) {
    const fetchFactState = async (params: Record<any, any>, almanac: Almanac) => {
      try {
        const state = await RuleRegistry.broker.call(
          `1.0.0.${params.serviceId}.${params.factStateAction}`,
          params
        );
        //@ts-ignore
        return state?.data;
      } catch (err) {
        console.error(`[Rule ${this.rule.name}] Failed to fetch fact state:`, err);
        return null;
      }
    };
    engine.addFact(fact, fetchFactState);
  }
}

export { RuleRegistry };
