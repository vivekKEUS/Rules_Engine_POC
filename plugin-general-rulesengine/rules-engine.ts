import { Engine} from "json-rules-engine";
import { RuleRegistry } from "./helpers/rules-engine-helper";
import type Moleculer from "moleculer";

class _RulesEngine {
  engine: Engine;

  constructor() {
    this.engine = new Engine();
  }

  execute(ctx:Moleculer.Context) {
    //before getting the dependent rules on facts, we need to add the facts on the engine
    //@ts-ignore 
    let dependentRulesonFacts = RuleRegistry.getDependentRulesOfFacts(ctx.params.facts)

    console.log("----DEPENDENT RULES ON STATE CHANGE----",dependentRulesonFacts.size)
    //I dont understand the requirement of params.id here
    RuleRegistry.addRulesAndUpdateFactsState(this.engine,dependentRulesonFacts)
    console.log("Running the engine, everything ok till here")
    // return this.engine.run({"time":1200})
    return this.engine.run();
  }
}

export { _RulesEngine };
