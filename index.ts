import { ServiceBroker } from "moleculer";
import { RulesEngineService } from "./plugin-general-rulesengine";
import CalendarService from "./plugin-calender";
import CronManager from "./plugin-cron-manager";
import { v4 as uuidv4 } from "uuid";
import { randomUUIDv7 } from "bun";
import { brokerConfig } from "./moleculer.config";
import { FanService } from "./plugin-fan";
import { lightService } from "./plugin-lighting";
import mongoose from "mongoose";
const broker = new ServiceBroker(brokerConfig);

broker.createService(RulesEngineService);
broker.createService(CalendarService);
broker.createService(CronManager);
broker.createService(FanService);
broker.createService(lightService);

try {
  await mongoose.connect("mongodb://10.1.4.238:27017/calendarDB", {});
  console.log("Connected to MongoDB");
} catch (error) {
  console.error("Error connecting to MongoDB:", error);
}

const rule6 = {
  name: "TurnOnLightsThenTurnOnFans",
  description:
    "If time between 12:00noon and 20:00, \
    then turn on lights and fans of bedroom, after 3 seconds turn off lights of porch",
  conditionSets: [
    {
      name: "daily time check 1",
      conditions: [
        {
          factName: "time",
          operation: "greaterThanInclusive",
          factValue: 1200,
          serviceId: "calendar", //service from which we will get the current fact's value
          FactStateAction: "currentTime", //returns time in 24 hours format
        },
      ],
    },
    {
      name: "daily time check 2",
      conditions: [
        {
          factName: "time",
          operation: "lessThanInclusive",
          factValue: 2000,
          serviceId: "calendar",
          factStateAction: "currentTime",
        },
      ],
    },
  ],
  event: {
    type: "Lights On and Fan On Automation, and after 10 seconds turn off the fan",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "kiotp.plugins.general.lighting",
            executionName: "BulbStateChange",
            customExecutionData: {
              deviceId: "device-1B",
              state: "on",
            },
          },
          {
            serviceId: "kiotp.plugins.general.fan",
            executionName: "ChangeFanState",
            customExecutionData: {
              deviceId: "device-2F",
              state: "on",
            },
          },
        ],
      },
      {
        order: 1,
        delay: 10,
      },
      {
        order: 2,
        routines: [
          {
            serviceId: "kiotp.plugins.general.fan",
            executionName: "ChangeFanState",
            customExecutionData: {
              deviceId: "device-88F",
              state: "off",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
};
/**
 * Usecase If Fan is on,turn on light
 * Wait for 10 seconds
 * make the color of light red
 * Wait for 10 seconds againg
 * If Fan is On and time is between 13:00 and 20:00, turn on motion detection service
 */
const rule7 = {
  name: "FanOnConsequent",
  description:
    "If fan on, \
  then turn on light and after 10 seconds make the color of light red",
  conditionSets: [
    {
      name: "Fan On Starter",
      conditions: [
        {
          name: "Fan On Condition",
          factName: "fan-power-state",
          operation: "equal",
          factValue: "on",
          serviceId: "kiotp.plugins.general.fan",
          factStateAction: "GetFanState",
        },
      ],
    },
  ],
  event: {
    type: "Fan On Success",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "kiotp.plugins.general.lighting",
            executionName: "BulbStateChange",
            customExecutionData: {
              deviceId: "device-1B",
              state: "on",
            },
          },
        ],
      },
      {
        order: 1,
        delay: 10,
      },
      {
        order: 2,
        routines: [
          {
            serviceId: "kiotp.plugins.general.lighting",
            executionName: "BulbColorChange",
            customExecutionData: {
              deviceId: "device-1B",
              color: "red",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 10,
};
const rule8 = {
  name: "FanOnConsequent2",
  description:
    "If fan on and time is between 13:00 and 20:00 \
  then turn on motion detection service",
  conditionSets: [
    {
      name: "Fan On Starter",
      conditions: [
        {
          name: "Fan On Condition",
          factName: "fan-power-state",
          operation: "equal",
          factValue: "on",
          serviceId: "kiotp.plugins.general.fan",
          factStateAction: "GetFanState",
        },
      ],
    },
    {
      name: "Time Check",
      conditions: [
        {
          factName: "time",
          operation: "greaterThanInclusive",
          factValue: 1300,
          serviceId: "calendar",
          factStateAction: "currentTime",
        },
      ],
    },
    {
      name: "Time Check 2",
      conditions: [
        {
          factName: "time",
          operation: "lessThanInclusive",
          factValue: 2000,
          serviceId: "calendar",
          factStateAction: "currentTime",
        },
      ],
    },
  ],
  event: {
    type: "Fan On and Time Success",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "kiotp.plugins.device.motion.detector",
            executionName: "MotionStateChange",
            customExecutionData: {
              state: "on",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 5,
};


broker
  .start()
  .then(async () => {
    // Add a cron job to log every 1 minute
    await broker.call("1.0.0.cron.manager.addJob", {
      id: "logsevery1Minutes",
      cronExpression: "* * * * *",
      taskFunction: async () => {
        console.log(
          "This message is logged every 1 minute starting from 00:00"
        );
        broker.sendToChannel("p2.facts.state.changed", {
          facts: ["time"],
          id: "FanOffAutomation",
        });
      },
    });

    try {
      // Wait for required services and add a rule to the rules engine
      await broker.waitForServices("1.0.0.kiotp.plugins.general.rulesengine");
      // await broker.call("1.0.0.kiotp.plugins.general.rulesengine.AddRule", rule5);
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
