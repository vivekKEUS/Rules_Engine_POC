import { ServiceBroker } from "moleculer";
import { PluginService as RulesEningeService } from "./plugin-general-rulesengine";
import { brokerConfig } from "./moleculer.config";
import { FanService } from "./plugin-fan";
import { lightService as LightService} from "./plugin-lighting";
import mongoose from "mongoose";
const broker = new ServiceBroker(brokerConfig);


try {
  await mongoose.connect("mongodb://localhost:27017/calendarDB", {});
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const rule6 = {
  name: "TurnOnLightWhenFanOn",
  description: "If fan is on, then turn on the light.",
  conditionSets: [
    {
      name: "Fan On Check",
      conditions: [
        {
          factName: "fan-power-state",
          operation: "equal",
          factValue: "on",
          serviceId: "1.0.0.kiotp.plugins.general.fan",
          factStateAction: "GetFanState",
          params: {
            deviceId: "Fan-F1",
          }
        },
      ],
    },
  ],
  event: {
    type: "Turn on Lights",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "1.0.0.kiotp.plugins.general.lighting",
            executionName: "ChangeLightState",
            action: "ChangeLightState",
            metadata : {ruleName: "TurnOnLightWhenFanOn"},
            customExecutionData: {
              deviceId: "Light-L2",
              LightState: "on",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 10,
};

const rule7 = {
  name: "ChangeLightColorWhenLightOn",
  description: "If light is on for 10 seconds, change its color to red.",
  conditionSets: [
    {
      name: "Light On Check",
      conditions: [
        {
          factName: "light-state",
          operation: "equal",
          factValue: "on",
          serviceId: "1.0.0.kiotp.plugins.general.lighting",
          factStateAction: "GetLightState",
          params :{
            deviceId: "Light-L2",
          }
        },
      ],
    },
  ],
  event: {
    type: "Light On Color Change",
    params: [
      {
        order: 1,
        delay: 10,
      },
      {
        order: 2,
        routines: [
          {
            serviceId: "1.0.0.kiotp.plugins.general.lighting",
            executionName: "ChangeLightColor",
            metadata : {ruleName: "ChangeLightColorWhenLightOn"},
            action: "ChangeLightColor",
            customExecutionData: {
              deviceId: "Light-L2",
              LightColor :"red",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 8,
};

const rule8 = {
  name: "TurnOnFanWhenLightRed",
  description: "If light is red, turn on the fan.",
  conditionSets: [
    {
      name: "Light Red Check",
      conditions: [
        {
          factName: "light-color",
          operation: "equal",
          factValue: "red",
          serviceId: "1.0.0.kiotp.plugins.general.lighting",
          factStateAction: "GetLightColor",
          params: {
            deviceId: "Light-L2",
          }
        },
      ],
    },
  ],
  event: {
    type: "Turn On Fan",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "1.0.0.kiotp.plugins.general.fan",
            executionName: "ChangeFanState",
            action: "ChangeFanState",
            customExecutionData: {
              deviceId: "Fan-F1",
              FanState: "on",
              metadata: {
                RuleName: "TurnOnFanWhenLightRed",
              }
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 6,
};



broker
  .start()
  .then(async () => {
    console.log("Broker Started")
    broker.createService(RulesEningeService);
    broker.createService(FanService);
    broker.createService(LightService);
    try {
      await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine");
      await broker.call(
        "1.0.0.kiotp.plugins.general.rulesengine.AddRule",
        rule6
      );
      await broker.call(
        "1.0.0.kiotp.plugins.general.rulesengine.AddRule",
        rule7
      );
      await broker.call(
        "1.0.0.kiotp.plugins.general.rulesengine.AddRule",
        rule8
      );
      console.log("Rule 6,7 & 8 added successfully to the rules engine");
    } catch (error) {
      console.error("Error during adding rules with the rules engine:", error);
    }
  })
  .catch((err) => {
    console.error("Error starting broker:", err);
  });
