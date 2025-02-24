const rule9 = {
  name: "AppleTVPlay",
  description: "If Apple TV is playing, turn on the workstation tracklights",
  conditionSets: [
    {
      name: "Apple TV Play Starter",
      conditions: [
        {
          name: "TV playing Condition",
          factName: "appletv-playing-state",
          operation: "equal",
          factValue: "playing",
          serviceId: "1.0.0.kiotp.plugins.core.deepmedia.tv.appletv",
          factStateAction: "GetPlayFactState",
          params: {
            id: "67b4578772cdc09958ef3649",
          },
        },
      ],
    },
  ],
  event: {
    type: "Apple TV Play Success",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 1,
        delay: 1,
      },
      {
        order: 2,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 3,
        delay: 1,
      },
      {
        order: 4,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 5,
        delay: 1,
      },
      {
        order: 6,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 7,
        delay: 1,
      },
      {
        order: 8,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 5,
};

const rule10 = {
  name: "AppleTVPause",
  description:
    "If Apple TV is paused, turn off and on the workstation tracklights,with some delays",
  conditionSets: [
    {
      name: "Apple TV Pause Starter",
      conditions: [
        {
          name: "TV paused Condition",
          factName: "appletv-playing-state",
          operation: "equal",
          factValue: "paused",
          serviceId: "1.0.0.kiotp.plugins.core.deepmedia.tv.appletv",
          factStateAction: "GetPlayFactState",
          params: {
            id: "67b4578772cdc09958ef3649",
          },
        },
      ],
    },
  ],
  event: {
    type: "Apple TV Pause Success",
    params: [
      {
        order: 0,
        routines: [
          {
            serviceId: "1.0.0.whatever",
            executionName: "Track-Light-Off",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-172",
            },
          },
        ],
      },
      {
        order: 1,
        delay: 1,
      },
      {
        order: 2,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 3,
        delay: 1,
      },
      {
        order: 4,
        routines: [
          {
            serviceId: "1.0.0.",
            executionName: "Track-Light-Off",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-172",
            },
          },
        ],
      },
      {
        order: 5,
        delay: 1,
      },
      {
        order: 6,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
      {
        order: 7,
        delay: 1,
      },
      {
        order: 8,
        routines: [
          {
            serviceId: "1.0.0.",
            executionName: "Track-Light-Off",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-172",
            },
          },
        ],
      },
      {
        order: 9,
        delay: 1,
      },
      {
        order: 10,
        routines: [
          {
            serviceId: "1.0.0.XO.XO..Service.com",
            executionName: "Track-Light-On",
            moleculerEvent: "p1.trigger-mainhub-scene-state-change",
            executionStrategy: "durable",
            customExecutionData: {
              sceneId: "3PsWpGjXvC-171",
            },
          },
        ],
      },
    ],
  },
  enabled: true,
  priority: 5,
};