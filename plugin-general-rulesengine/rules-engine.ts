import { Engine} from "json-rules-engine";
import { RuleRegistry } from "./helpers/ruleRegistry";


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
    let dependentRulesonFacts = RuleRegistry.getDependentRulesOfFacts(params.facts)

    console.log("----DEPENDENT RULES ON STATE CHANGE----",dependentRulesonFacts.size)
    //I dont understand the requirement of params.id here
    console.log("params", params)
    RuleRegistry.addRulesAndUpdateFactsState(this.engine,dependentRulesonFacts)
    console.log("Running the engine, everything ok till here")
    // return this.engine.run({"time":1200})
    return this.engine.run();
  }
}

export { _RulesEngine };
