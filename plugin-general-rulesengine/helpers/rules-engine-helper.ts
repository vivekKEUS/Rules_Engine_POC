import {
  Almanac,
  Engine,
} from "json-rules-engine";
import type { NestedCondition, RuleProperties } from "json-rules-engine";
import * as RuleModels from "../models/kiotp_rules_engine_model";
import { GetRulesAction } from "../actions/manage-rules/rules";
import { Context, ServiceBroker } from "moleculer";

/*
The TRule type starts with the Omit utility type, which is used to create a new type 
by excluding the triggers property from the RuleModels.IRule type. The Omit utility 
is useful when you want to use an existing type but need to exclude one or more 
properties from it.
*/

type TRule = Omit<RuleModels.IRule, "triggers"> & {
  conditionIds: string[];
  conditions: Array<RuleModels.ICondition[]>;
  conditionSetNames: string[];
};

class _RulesManager {
  static rulesMap: Map<string, _Rule> = new Map();
  static broker: ServiceBroker;

  static init(broker: ServiceBroker) {
    this.broker = broker;
    this.updateRules();
  }

  static async updateRules() {
    try {
      let rules: Array<TRule> = [];
      let rulesRes = await GetRulesAction.handler();
      if (rulesRes && !rulesRes.success) {
        console.log("failed to start rules engines", rulesRes.error);
        return;
      }

      if (this.rulesMap) {
        this.rulesMap.clear();
      }

      rules = <TRule[]>rulesRes?.data;

      for (const rule of rules) {
        console.log(rule);
        if (!rule.enabled) {
          // this.rulesMap.delete(rule.id);
          console.log("rule.enabled", rule.enabled, this.rulesMap);

          continue;
        }
        let _rule = new _Rule(rule);
        this.rulesMap.set(rule.id, _rule);
      }
    } catch (err) {
      console.log("failed to update rules map", err);
    }
  }

  static getDependentRulesOfFacts(facts: Array<string>) {
    let rules: Array<TRule> = [];
    console.log("---facts", facts, this.rulesMap.keys());
    for (const ruleId of this.rulesMap.keys()) {
      let listsOfFactNames = this.rulesMap
        .get(ruleId)
        ?.eventIdToFactSetMap.values();

      console.log("----CHECKING LIST OF FACTS NAMES ", listsOfFactNames);

      if (!listsOfFactNames) return rules;

      let related = false;

      for (const list of listsOfFactNames) {
        for (const fact of facts) {
          if (list.has(fact)) {
            related = true;
            rules.push(<TRule>this.rulesMap.get(ruleId)?.rule);
            break;
          }
        }

        if (related) {
          break;
        }
      }
    }

    return rules;
  }

  static addRulesAndUpdateFactsState(
    engine: Engine,
    rules: Array<TRule>,
    eventId: string = ""
  ) {
    for (const rule of rules) {
      let ruleEngine = this.rulesMap.get(rule.id);
      if (!ruleEngine) {
        continue;
      }

      ruleEngine.updateFacts(engine, eventId);

      let ruleProps = ruleEngine.getRuleProperties();

      engine.addRule(ruleProps);
    }
  }
}

class _Rule {
  rule: TRule;

  ruleProperties: RuleProperties;

  eventIdToFactSetMap: Map<string, Set<string>>;

  constructor(rule: TRule) {
    this.rule = rule;
    this.eventIdToFactSetMap = new Map();
    this.ruleProperties = this.createRuleProperties();
    this.formAndGetConditions();
  }

  createRuleProperties() {
    return {
      conditions: {
        all: [],
      },
      event: this.rule.event,
    };
  }

  getRuleProperties() {
    return this.ruleProperties;
  }

formAndGetConditions() {
    for (let i = 0; i < this.rule.conditions.length; i++) {
      const conditionSet = this.rule.conditions[i];

      if (!Array.isArray(conditionSet)) {
        // console.log("conditionSet is not an array:", conditionSet);
        continue;
      }

      let newCondition: NestedCondition = { any: [] };

      for (const condition of conditionSet) {
        if (!condition || !condition.factName || !condition.operation) {
          continue;
        }

        let factCondition = this.formFactCondition(condition);
        console.log("ADDING CONDITION FOR RULE---------------", factCondition);

        newCondition.any.push(factCondition);

        this.addFactToEventFactSetMap(condition);
      }
      console.log("event match condition", newCondition);
      //@ts-ignore
      this.ruleProperties.conditions.all.push(newCondition);
    }
}
  formFactCondition(condition: RuleModels.ICondition) {
    let keys = condition.factName.split(".");

    let factCondition: NestedCondition = {
      fact: keys[0],
      operator: condition.operation,
      value: condition.factValue,
      params: {
        eventId: condition.eventId,
        ruleId: this.rule.id,
        serviceId: condition.serviceId,
        factState: condition.factStateAction,
      },
    };

    if (condition.factPath) {
      factCondition.path = condition.factPath;
    } else {
      factCondition.path = condition.factName;
    }

    return factCondition;
  }

  //CACHING THE FACT WITH EVENTiD
  addFactToEventFactSetMap(condition: RuleModels.ICondition) {
    if (this.eventIdToFactSetMap.has(condition.eventId)) {
      this.eventIdToFactSetMap.get(condition.eventId)?.add(condition.factName);
    } else {
      let set = new Set<string>();
      set.add(<string>condition.factName);
      this.eventIdToFactSetMap.set(condition.eventId, set);
    }
  }

  checkIfFactIsRelated(eventId: string) {
    return this.eventIdToFactSetMap.has(eventId);
  }

  updateFacts(engine: Engine, eventId: string) {
    // this.count+=1
    let factsToUpdate = this.eventIdToFactSetMap.keys();

    for (const fact of factsToUpdate) {
      let factsToAdd = this.eventIdToFactSetMap.get(fact);
      if (!factsToAdd) continue;
      console.log(
        "ADDING FACT --",
        eventId,
        this.eventIdToFactSetMap,
        factsToAdd
      );
      for (const factToAdd of factsToAdd) {
        this.updateLatestStateOfFact(engine, factToAdd, eventId);
      }
    }
  }

  async updateLatestStateOfFact(engine: Engine, fact: string, eventId: string) {
    let serviceVersion = "1.0.0";
    const fetchFacts = async (
      params: Record<string, any>,
      alamnac: Almanac
    ) => {
      let factState: any = null;
      try {
        let state: any = await _RulesManager.broker.call(
          `${serviceVersion}.${params.serviceId}.${params?.factState}`,
          {
            id: params.eventId,
          }
        );
        console.log("-----GOT FACT STATE-----", state);
        factState = state?.data;
      } catch (err) {
        console.log("----FAILED TO GET FACT STATE-----", err);
      }

      // let bool = this.count%2 == 0
      return factState;
      // return bool
    };

    engine.addFact(fact, fetchFacts);
  }
}

export { _RulesManager };
