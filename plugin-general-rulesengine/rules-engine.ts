import { Engine} from "json-rules-engine";
import type { NestedCondition, RuleProperties } from "json-rules-engine";
import * as RuleModels from "./models/kiotp_rules_engine_model";
import { _RulesManager } from "./helpers/rules-engine-helper";

type TRule = Omit<RuleModels.IRule, "triggers"> & {
  conditionIds: string[];
  conditions: Array<RuleModels.ICondition[]>;
  conditionSetNames: string[];
};

interface IExecuteParams{
  id: string,
  facts: Array<string>
}

class _RulesEngine {
  engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  execute(params:IExecuteParams) {
    //before getting the dependent rules on facts, we need to add the facts on the engine

    //params is an action here, see the schema of IAction
    //how the hell can I get any facts from the action, I need to access the wholeass rule
    let dependentRulesonFacts = _RulesManager.getDependentRulesOfFacts(params.facts)

    console.log("----DEPENDENT RULES ON STATE CHANGE----",dependentRulesonFacts.length)
    //I dont understand the requirement of params.id here
    _RulesManager.addRulesAndUpdateFactsState(this.engine,dependentRulesonFacts,params.id)
    console.log("Running the engine, everything ok till here")
    // return this.engine.run({"time":1200})
    return this.engine.run();
  }
}

export { _RulesEngine };
