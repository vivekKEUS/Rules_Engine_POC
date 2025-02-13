import {
  Almanac,
  Engine,
} from "json-rules-engine";
import type { AllConditions, NestedCondition, RuleProperties } from "json-rules-engine";
import * as RuleModels from "../models/kiotp_rules_engine_model";
import { GetRulesAction } from "../actions/manage-rules/rules";
import { ServiceBroker } from "moleculer";

type TRule = RuleModels.IRule
interface FactUpdateParams {
  eventId: string;
  serviceId: string;
  factStateAction: string;
}
class _RulesManager {
  private static rulesMap: Map<string, _Rule> = new Map(); //mapping of rule id to rule
  public static broker: ServiceBroker;

  public static init(broker: ServiceBroker) {
    this.broker = broker;
    this.updateRules();
  }

  public static async updateRules() {
    try {
      console.log("Rules Manager fetching all rules...");
      const rulesResponse = await GetRulesAction.handler();

      if (!rulesResponse?.success) {
        console.error("Failed to fetch rules:", rulesResponse?.error);
        return;
      }
      this.rulesMap.clear();
      const rules = rulesResponse.data as TRule[];
      
      rules.forEach(rule => {
        if (!rule.enabled) {
          console.log(`Rule ${rule.id} is disabled. Skipping...`);
          return;
        }
        this.rulesMap.set(rule.id, new _Rule(rule));
      });

      console.log(`Rules updated. Total rules: ${this.rulesMap.size}`);
    } catch (error) {
      console.error("Failed to update rules map:", error);
    }
    console.log(`Size of Rules' Hashmap =`, this.rulesMap.size);
  }

  static getDependentRulesOfFacts(facts: Array<string>) {
    //why do need to make use of TRule here
    let rules: Array<TRule> = [];
    console.log("---facts", facts, this.rulesMap.keys());
    //iterate over all the rules that we currently have in rule-manager,
    //for this rule, get all its list of set of fact
    //if we have some related fact, then add this rule(_Rule) in rules array
    for (const ruleId of this.rulesMap.keys()) {
      let givenRule = this.rulesMap.get(ruleId)
      if(givenRule == undefined){
        return rules //here it is rules is  empty ([])
      }
    let listsOfFactNames = new Set(
        Array.from(givenRule.eventIdToFactSetMap.values())
            .flatMap(set => Array.from(set))
    );
      
      console.log("----CHECKING LIST OF FACTS NAMES ", listsOfFactNames);

      if (!listsOfFactNames) return rules;

      let related = false;

        for (const fact of facts) {
          if (listsOfFactNames.has(fact)) {
            related = true;
            rules.push(<TRule>this.rulesMap.get(ruleId)?.rule);
            break;
          }
        }
        //creating a flag so that we can only append the data one time
        if (related) {
          break;
        }
    }
    console.log(`dependent rules = ${rules}`)
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
      // ruleEngine is an object of _Rule class
      //update the needed rules with the given engine and eventId
      //I dont understand the need of the eventId here
      ruleEngine.updateFacts(engine, eventId);

      let ruleProps = ruleEngine.getRuleProperties();
      console.log(`ruleProps = ${JSON.stringify(ruleProps)}`)
      console.log(`type = ${ruleProps.event.type}`)
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
    this.buildConditions();
  }
  private createRuleProperties() { //returns a basic structure of rule properties
    return {
      conditions: {
        all: [],
      },
      event: this.rule.event,
    };
  }

  public getRuleProperties() {
    return this.ruleProperties;
  }

//this function create the condition for the ruleProperties (following the 
//any and all subconditions of json-rules-engine) of the _Rule class
//perhaps this ruleProperties can then be added to the json-rules-engine
private buildConditions() {
    this.rule.conditions.forEach(conditionSet => {
      const nestedCondition: NestedCondition = { any: [] };

      conditionSet.conditions.forEach(condition => {
        if (!condition.factName || !condition.operation) {
          console.error("Invalid condition: missing factName or operation");
          return;
        }

        nestedCondition.any.push(this.formFactCondition(condition));
        this.addFactToEventFactSetMap(condition);
      });

      (this.ruleProperties.conditions as AllConditions).all.push(nestedCondition);
    });
  }
  formFactCondition(condition: RuleModels.ICondition):NestedCondition{
    let [fact] = condition.factName.split(".");
    let factCondition: NestedCondition = {
      fact: fact,
      operator: condition.operation,
      value: condition.factValue,
      params: {
        eventId: condition.eventId, //eventId is the deviceId or sceneId from where the fact is being triggered
        ruleId: this.rule.id, //ruleId is the id of the rule containig this fact
        serviceId: condition.serviceId, //serviceId and factState will helps us in getting the current fact-value
        factState: condition.factStateAction, //contains the name of the moleculer action which will give us the fact's current value
        recurrenPattern: condition.factObject,
      },
      path: condition.factPath || condition.factName,
    };

    return factCondition;
  }
  addFactToEventFactSetMap(condition: RuleModels.ICondition) {
    const { eventId, factName } = condition;
    if (!this.eventIdToFactSetMap.has(eventId)) {
      this.eventIdToFactSetMap.set(eventId, new Set());
    }
    this.eventIdToFactSetMap.get(eventId)?.add(factName);
  }

  checkIfFactIsRelated(eventId: string) {
    return this.eventIdToFactSetMap.has(eventId);
  }

  updateFacts(engine: Engine, eventId: string) {
    let factsToUpdate = this.eventIdToFactSetMap.keys();
    for (const fact of factsToUpdate) {
      let factsToAdd = this.eventIdToFactSetMap.get(fact);
      if (!factsToAdd) continue;
      console.log(
        "ADDING FACT --",
        this.eventIdToFactSetMap,
        factsToAdd
      );
      for (const factToAdd of factsToAdd) {
        this.updateLatestStateOfFact(engine, factToAdd, eventId);
      }
    }
  }

  //using this we are updating all the states of facts, which we know of
  private async updateLatestStateOfFact(engine: Engine, fact: string, eventId: string) {
    let serviceVersion = "1.0.0";
    const fetchFactState = async (
      params: FactUpdateParams,
      alamnac: Almanac
    ) => {
      try {
        const state = await _RulesManager.broker.call(
          `${serviceVersion}.${params.serviceId}.${params.factStateAction}`,
          {
            id: params.eventId,
          }
        );
        //@ts-ignore
        return state?.data;
      } catch (err) {
        console.error("Failed to fetch fact state:", err);
        return null;
      }
    };
    //@ts-ignore
    engine.addFact(fact, fetchFactState);
  }
}

export { _RulesManager };
