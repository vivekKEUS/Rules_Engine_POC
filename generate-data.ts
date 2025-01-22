import { exec } from "child_process";
import { faker } from "@faker-js/faker";

interface EventData {
  eventId: string;
  title: string;
  startDateUtc: string;
  endDateUtc: string;
  isAllDay: boolean;
  duration: number;
  isRecurring: boolean;
  recurrencePattern: string;
}

function generateEventData(): EventData {
  const eventId = faker.string.uuid();
  const title = faker.lorem.words(3);
  const startDateUtc = faker.date.future().toISOString();
  const endDateUtc = faker.date.future({ years: 0.5 }).toISOString();
  const isAllDay = faker.datatype.boolean();
  const duration = faker.number.int({ min: 30, max: 120 });
  const isRecurring = faker.datatype.boolean();

  let recurrencePattern = "";
  if (isRecurring) {
    recurrencePattern =
      faker.datatype.boolean() && faker.datatype.boolean()
        ? "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR"
        : faker.helpers.arrayElement([
            "FREQ=DAILY;INTERVAL=1",
            "FREQ=WEEKLY;INTERVAL=2",
            "FREQ=MONTHLY;INTERVAL=1",
          ]);
  }

  return {
    eventId,
    title,
    startDateUtc,
    endDateUtc,
    isAllDay,
    duration,
    isRecurring,
    recurrencePattern,
  };
}

async function createEventWithGeneratedData(eventData: EventData): Promise<void> {
  const cliCommand = `node calendar-cli.js create-event --eventId "${eventData.eventId}" --title "${eventData.title}" --startDateUtc "${eventData.startDateUtc}" --endDateUtc "${eventData.endDateUtc}" --isAllDay "${eventData.isAllDay}" --duration "${eventData.duration}" --isRecurring "${eventData.isRecurring}" --recurrencePattern "${eventData.recurrencePattern || ''}"`;

  return new Promise((resolve, reject) => {
    exec(cliCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        reject(new Error(stderr));
        return;
      }
      console.log(`stdout: ${stdout}`);
      resolve();
    });
  });
}

async function generateAndCreateEvents(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    const eventData = generateEventData();
    console.log(`Creating event ${i + 1}:`, eventData);
    await createEventWithGeneratedData(eventData);
  }
}

generateAndCreateEvents().catch(console.error);