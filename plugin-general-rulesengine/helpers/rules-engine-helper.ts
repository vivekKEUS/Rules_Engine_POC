import {
  Almanac,
  Engine,
} from "json-rules-engine";
import type { AllConditions, NestedCondition, RuleProperties } from "json-rules-engine";
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
  //why are we creating this, why is the need to have seperate conditionIds and 
  //conditionSetNames
  conditionIds: string[];
  conditions: Array<RuleModels.ICondition[]>;
  conditionSetNames: string[];
};

class _RulesManager {
  static rulesMap: Map<string, _Rule> = new Map(); //mapping of rule id to rule
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
          //here we are not adding the enabled rules into the rules engine and executing it
          //perhaps that part is done somwhere else
          continue;
        }
        let _rule = new _Rule(rule); //_Rule contains rule, ruleproperties, eventId -> set of facts mapping
        this.rulesMap.set(rule.id, _rule);
      }
    } catch (err) {
      console.log("failed to update rules map", err);
    }
  }

  static getDependentRulesOfFacts(facts: Array<string>) {
    //why do need to make use of TRule here
    let rules: Array<TRule> = [];
    console.log("---facts", facts, this.rulesMap.keys());
    //iterate over all the rules that we currently have in rule-manager,
    //for this rule, get all its list of set of fact
    //if we have some related fact, then add this rule(_Rule) in rules array
    for (const ruleId of this.rulesMap.keys()) {
      let listsOfFactNames = this.rulesMap
        .get(ruleId)
        ?.eventIdToFactSetMap.values(); //map().values returns list of set of facts we currently have

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
        //creating a flag so that we can only append the data one time
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
      // ruleEngine is an object of _Rule class
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
    this.formAndGetConditions(); //add the all and any condition in the ruleProperties
  }

  createRuleProperties() { //returns a basic structure of rule properties
    return {
      conditions: {
        all: [],
      },
      event: this.rule.event, //every rule has only one event
    };
  }

  getRuleProperties() {
    return this.ruleProperties;
  }

//this function create the condition for the ruleProperties (following the 
//any and all subconditions of json-rules-engine) of the _Rule class
//perhaps this ruleProperties can then be added to the json-rules-engine
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
        //this symbolises that any confition of the conditionSet need to true for 
        // the entire conditionSet to be true
        //this is a very important piece of code explaining the architecture
        newCondition.any.push(factCondition);

        //i dont understand this code, need to study about in greater detail
        this.addFactToEventFactSetMap(condition);
      }
      console.log("event match condition", newCondition);
      this.ruleProperties.conditions = <AllConditions>this.ruleProperties.conditions;
      //the condition sets are added to the all array, forming an and operation
      this.ruleProperties.conditions.all.push(newCondition);
    }
}
  formFactCondition(condition: RuleModels.ICondition) {
    //we splitting fact on the "." from factName, and taking the first name
    let keys = condition.factName.split(".");
    let factCondition: NestedCondition = {
      fact: keys[0],
      operator: condition.operation,
      value: condition.factValue,
      params: {
        //this params can be used to calcule the value using
        eventId: condition.eventId, //eventId is the deviceId or sceneId from where the fact is being triggered
        ruleId: this.rule.id, //ruleId is the id of the rule containig this fact
        serviceId: condition.serviceId, //serviceId is the name of service triggering the fact change event
        factState: condition.factStateAction, //contains the name of the moleculer action which will give us the fact's current value
        //we are not include factValue or factObject becaues they are not used for fact state calculation
        //but they used for evaluating the conditions of the rules
      },
    };

    //i need to see how exactly are we feeding data into the factPath
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

  //after understanding this function, I need to understand the
  async updateLatestStateOfFact(engine: Engine, fact: string, eventId: string) {
    let serviceVersion = "1.0.0";
    const fetchFacts = async (
      params: Record<string, any>,
      alamnac: Almanac
    ) => {
      let factState: any = null;
      try {
        let state: any = await _RulesManager.broker.call(
          //in the rules I have to include the service name
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
