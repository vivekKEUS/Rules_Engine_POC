const rule10 = {
  name: "RelaxModeAutomation",
  description:"From 17:00 to 19:00, turn on the relax mode scene",
  conditionSets: [
    {
        name: "Daily time check 1",
        conditions: [
          {
            factName: "time",
            operation: "greaterThanInclusive",
            factValue: 1700,
            serviceId: "1.0.0.kiotp.plugins.general.rulesengine", //service from which we will get the current fact's value
            factStateAction: "CurrentTime", //returns time in 24 hours format
          },
        ],
      },
      {
        name: "daily time check 2",
        conditions: [
          {
            factName: "time",
            operation: "lessThanInclusive",
            factValue: 1900,
            serviceId: "1.0.0.kiotp.plugins.general.rulesengine", //service from which we will get the current fact's value
            factStateAction: "CurrentTime", //returns time in 24 hours format
          },
        ],
      },
  ],
  event: {
    type: "RelaxModeOn",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "1.0.0.kiotp.plugins.general.hubbdridge",
            executionName: "Turn On Relax Scene",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
                "sceneId": "3PsWpGjXvC-152"
            },
          },
        ],
      },
    ]
}
};

