import mongoose, { Schema, Document} from 'mongoose';

// Interfaces to define the shape of our documents
interface IResponse<Data = any> {
  success: boolean;
  error?: string;
  data?: Data;
}
//event and actions are same here

interface ICondition extends Document {
  id: string;
  operation: string;
  factName: string;
  factValue?: any;
  factStateAction?: string;
  factPath?: string;
  serviceId: string;
}


interface ITrigger extends Document {
  id: string;
  triggerName: string;
  maxTimeDifferenceMs?: number;
  waitTillCompletion: boolean;
  customTriggerData?: Record<string, any>;
}

interface IRuleConditions extends Document {
  id: string;
  name: string;
  conditionSets: ICondition[];
}

// interface IRuleEventParams extends Document {
//   actions: IAction[];
// }
export interface IRuleActions extends Document{
  order: number;
  delay?: number;
  triggers?: ITrigger[];
}

interface IRuleEvent extends Document {
  name: string;
  actions: IRuleActions[];
}

interface IRule extends Document {
  id: string;
  name: string;
  description?: string;
  conditions: IRuleConditions[];
  event: IRuleEvent;
  enabled?: boolean;
  priority ?: number;
}
const ConditionSchema = new Schema<ICondition>({
  id: { type: String, required: true },
  operation: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  factName: { type: String, required: true },
  factValue: { type: Schema.Types.Mixed },
  factStateAction: { type: String, default: "get" },
  factPath: String,
  serviceId: { type: String, required: true }
});

const ActionDataSchema = new Schema<IActionData>({
  serviceId: { type: String, required: true },
  emitTriggerAction: String,
  deviceType: String,
  devcieCategory: String,
  customActionData: { type: Map, of: Schema.Types.Mixed }
});

const ActionSchema = new Schema<IAction>({
  id: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  strategy: String,
  maxTimeDifferenceMs: Number,
  waitTillCompletion: { type: Boolean, required: true },
  actionData: { type: ActionDataSchema, required: true }
});

const RuleConditionsSchema = new Schema<IRuleConditions>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  conditions: [ConditionSchema]
});
const RuleEventParamsSchema = new Schema<IRuleEventParams>({
  actions: [
    {
    order: { type: Number, required: true},
    delay: { type: Number},
    triggers: [ActionSchema]
  }
]
});

const RuleEventSchema = new Schema<IRuleEvent>({
  type: { type: String, required: true },
  params: { type: RuleEventParamsSchema, required: true }
});

const RuleSchema = new Schema<IRule>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  conditions: [RuleConditionsSchema],
  event: { type: RuleEventSchema, required: true },
  enabled: { type: Boolean, default: true },
  roomId: String,
  priority: {type: Number, default: 1}
});
export async function RulesDB(){
  await mongoose.connect('mongodb://localhost:27017/calendarDB');
}
const Rule = mongoose.model<IRule>('Rule', RuleSchema);

// Methods class converted to static methods on the Rule model
class RuleMethods {
  static async getRule(ruleId: string): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ id: ruleId });
      if (!rule) {
        return { success: false, error: "rule does not exist" };
      }
      return { success: true, data: rule.toObject() };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async getRules(): Promise<IResponse>{
    try{
      const rules = await Rule.find();
      const rulesAsObject = rules.map(rule => rule.toObject())
      // console.log("RulesasObject", rulesAsObject)
      if(!rules){
        return {success: false, error: "No rules found"}
      }
      
      return {success: true, data: rulesAsObject}
    } catch (error){
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }

  static async addRule(ruleData: IRule): Promise<IResponse> {
    try {
      const rule = new Rule(ruleData);
      await rule.save()
      return { success: true, data: rule.toObject() };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }

  static async removeRule(ruleId: string): Promise<IResponse> {
    try {
      const result = await Rule.deleteOne({ id: ruleId });
      if (result.deletedCount === 0) {
        return { success: false, error: "rule does not exist" };
      }
      return { success: true };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }

  static async updateRule(ruleData: Partial<IRule>): Promise<IResponse> {
    try {
      const rule = await Rule.findOneAndUpdate(
        { id: ruleData.id },
        { $set: ruleData },
        { new: true }
      );
      if (!rule) {
        return { success: false, error: "rule does not exist" };
      }
      return { success: true, data: rule.toObject() };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  // static async addAction(ruleId: string, action: IAction): Promise<IResponse> {
  //   try {
  //     const rule = await Rule.findOne({ id: ruleId });
  //     if (!rule) {
  //       return { success: false, error: "rule does not exist" };
  //     }
  //     rule.event.params.actions.push(action);
  //     return { success: true, data: rule.event.params.actions };
  //   } catch (error) {
  //     //@ts-ignore
  //     return { success: false, error: error.message };
  //   }
  // }
  // static async removeAction(ruleId: string, actionId: string): Promise<IResponse> {
  //   try {
  //     const rule = await Rule.findOne({ id: ruleId });
  //     if (!rule) {
  //       return { success: false, error: "rule does not exist" };
  //     }
  //     const actionIndex = rule.event.params.actions.findIndex(a => a.id === actionId);
  //     if (actionIndex === -1) {
  //       return { success: false, error: "action does not exist" };
  //     }
  //     rule.event.params.actions.splice(actionIndex, 1);
  //     return { success: true, data: rule.event.params.actions };
  //   } catch (error) {
  //     //@ts-ignore
  //     return { success: false, error: error.message };
  //   }
  // }
  // static async updateAction(ruleId: string, action: IAction): Promise<IResponse> {
  //   try {
  //     // Find the rule
  //     const rule = await Rule.findOne({ id: ruleId });
  //     if (!rule) {
  //       return { success: false, error: "rule does not exist" };
  //     }
  //     const actionIndex = rule.event.params.actions.findIndex(a => a.id === action.id);
  //     if (actionIndex === -1) {
  //       return { success: false, error: "action does not exist" };
  //     }
  //     // Update the action
  //     rule.event.params.actions[actionIndex] = action;
  //     return { success: true, data: rule.event.params.actions };

  //   } catch (error) {
  //     //@ts-ignore
  //     return { success: false, error: error.message };
  //   }
  // }
  static async createConditionSet(conditionSet: Partial<IRuleConditions>): Promise<IResponse> {
    console.log("Creating condition set");
    try {
      conditionSet.id = new mongoose.Types.ObjectId().toHexString();
      return { success: true, data: conditionSet };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async addConditionSet(ruleId: string, conditionSet: IRuleConditions): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ id: ruleId });
      if (!rule) {
        return { success: false, error: "rule does not exist" };
      }
      let newConditionSet = await this.createConditionSet(conditionSet);
      if (!newConditionSet.success || !newConditionSet.data) {
        return { success: false, error: "Failed to create condition set" };
      }
      rule.conditions.push(newConditionSet.data);
      await rule.save();
      return { success: true, data: rule.conditions };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }

  static async deleteConditionSet(conditionSetId: string): Promise<IResponse> {
    try {
      const rules = await Rule.find({ "conditions.id": conditionSetId });

      if (!rules.length) {
        return { success: false, error: "condition set does not exist" };
      }

      for (const rule of rules) {
        rule.conditions = rule.conditions.filter(
          (conditionSet) => conditionSet.id !== conditionSetId
        );
        await rule.save();
      }

      return { success: true };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async removeConditionSetFromRule(ruleId: string, conditionSetId: string): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ id: ruleId });
      if (!rule) {
        return { success: false, error: "rule dofailed to insert rule in mongoes not exist" };
      }

      const conditionIndex = rule.conditions.findIndex(
        (c) => c.id === conditionSetId
      );

      if (conditionIndex === -1) {
        return { success: false, error: "condition set does not exist" };
      }

      rule.conditions.splice(conditionIndex, 1);
      await rule.save();
      return { success: true };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async addConditionItem(conditionSetId: string, condition: ICondition): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ "conditions.id": conditionSetId });
      if (!rule) {
        return { success: false, error: "condition set does not exist" };
      }

      const conditionSet = rule.conditions.find(
        (cs) => cs.id === conditionSetId
      );

      if (!conditionSet) {
        return { success: false, error: "condition set not found" };
      }

      condition.id = new mongoose.Types.ObjectId().toString();
      conditionSet.conditions.push(condition);
      await rule.save();

      return { success: true, data: conditionSet.conditions };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async updateConditionInSet(conditionSetId: string, condition: ICondition): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ "conditions.id": conditionSetId });
      if (!rule) {
        return { success: false, error: "condition set does not exist" };
      }

      const conditionSet = rule.conditions.find(
        (cs) => cs.id === conditionSetId
      );

      if (!conditionSet) {
        return { success: false, error: "condition set not found" };
      }

      const conditionIndex = conditionSet.conditions.findIndex(
        (cond) => cond.id === condition.id
      );

      if (conditionIndex === -1) {
        return { success: false, error: "condition not found" };
      }

      conditionSet.conditions[conditionIndex] = condition;
      await rule.save();

      return { success: true };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
  static async removeConditionItem(conditionSetId: string, conditionId: string): Promise<IResponse> {
    try {
      const rule = await Rule.findOne({ "conditions.id": conditionSetId });
      if (!rule) {
        return { success: false, error: "condition set does not exist" };
      }
  
      const conditionSet = rule.conditions.find(
        (cs) => cs.id === conditionSetId
      );
  
      if (!conditionSet) {
        return { success: false, error: "condition set not found" };
      }
  
      const conditionIndex = conditionSet.conditions.findIndex(
        (cond) => cond.id === conditionId
      );
  
      if (conditionIndex === -1) {
        return { success: false, error: "condition not found" };
      }
  
      conditionSet.conditions.splice(conditionIndex, 1);
      await rule.save();
  
      return { success: true };
    } catch (error) {
      //@ts-ignore
      return { success: false, error: error.message };
    }
  }
}


export {
  Rule,
  RuleMethods,
};
export type{
  IRule,
  IAction,
  IActionData,
  ICondition,
  IRuleConditions,
  IRuleEvent,
  IRuleEventParams,
  IResponse
}