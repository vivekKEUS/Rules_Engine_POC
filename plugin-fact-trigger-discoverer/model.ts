import { model, Schema } from "mongoose";

export interface IFacts extends Document {
    ServiceId: string;
    ServiceVersion: string;
    FactName: string;
    FactValue: any[];
};
export interface ITriggers extends Document {
    ServiceId: string;
    ServiceVersion: string;
    TriggerName: string;
    TriggerAction: string; //this method will be called to execute the trigger
    TriggerValue: any[];
}
//create Facts and Triggers model for mongodb

export const Facts = model<IFacts>('Facts', new Schema({
    ServiceId: String,
    ServiceVersion: String,
    FactName: String,
    FactValue: Array
}));
export const Triggers = model<ITriggers>('Triggers', new Schema({
    ServiceId: String,
    ServiceVersion: String,
    TriggerName: String,
    TriggerAction: String,
    TriggerValue: Array
}))

//write function to add Facts and add triggers
export const AddFacts = async (ServiceId: string, ServiceVersion: string, FactName: string, FactValue: any[]) => {
    const fact = new Facts({
        ServiceId,
        ServiceVersion,
        FactName,
        FactValue
    });
    await fact.save();
    return fact;
}
export const AddTriggers = async (ServiceId: string, ServiceVersion: string, TriggerName: string, TriggerAction: string, TriggerValue: any[]) => {
    const trigger = new Triggers({
        ServiceId,
        ServiceVersion,
        TriggerName,
        TriggerAction,
        TriggerValue
    });
    await trigger.save();
    return trigger;
}
//write function to get facts and triggers
export const GetFacts = async () => {
    return Facts.find({});
}
export const GetTriggers = async () => {
    return Triggers.find({});
}