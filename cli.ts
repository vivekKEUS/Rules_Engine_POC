import { Command } from "commander";
import mongoose from "mongoose";
import inquirer from "inquirer";
import { CalendarEvent, connectToDatabase } from "./model";
import { v4 as uuidv4 } from 'uuid';
import { parse, isValid, formatISO, addMinutes } from 'date-fns';

const program = new Command();

// Helper function to parse flexible date inputs
//@ts-ignore
function parseFlexibleDate(input) {
  // Handle common date formats and keywords
  const normalizedInput = input.toLowerCase().trim();
  
  // Handle relative dates
  if (normalizedInput === 'today') {
    return new Date();
  }
  if (normalizedInput === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  // Try parsing common date formats
  const dateFormats = [
    'yyyy-MM-dd',           // 2024-01-13
    'MM/dd/yyyy',           // 01/13/2024
    'MM-dd-yyyy',           // 01-13-2024
    'MMMM d, yyyy',         // January 13, 2024
    'MMM d, yyyy',          // Jan 13, 2024
    'MM/dd/yyyy HH:mm',     // 01/13/2024 14:30
    'yyyy-MM-dd HH:mm',     // 2024-01-13 14:30
    'MM/dd/yyyy h:mm a',    // 01/13/2024 2:30 PM
  ];

  for (const format of dateFormats) {
    const parsedDate = parse(input, format, new Date());
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  }

  throw new Error('Invalid date format');
}

// Helper function to parse duration input
//@ts-ignore
function parseDuration(input) {
  const normalizedInput = input.toLowerCase().trim();
  
  // Handle natural language duration inputs
  const hourMatch = normalizedInput.match(/(\d+)\s*(?:hour|hr|h)/);
  const minuteMatch = normalizedInput.match(/(\d+)\s*(?:minute|min|m)/);
  
  let totalMinutes = 0;
  
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }
  
  // If just a number is provided, assume minutes
  if (!hourMatch && !minuteMatch && /^\d+$/.test(normalizedInput)) {
    totalMinutes = parseInt(normalizedInput);
  }
  
  if (totalMinutes <= 0) {
    throw new Error('Invalid duration');
  }
  
  return totalMinutes;
}

// Helper function to parse recurrence pattern
//@ts-ignore
function parseRecurrencePattern(input) {
  const normalizedInput = input.toLowerCase().trim();
  
  // Map common phrases to iCal format
  const recurrenceMap = {
    'daily': 'FREQ=DAILY;INTERVAL=1',
    'every day': 'FREQ=DAILY;INTERVAL=1',
    'weekly': 'FREQ=WEEKLY;INTERVAL=1',
    'every week': 'FREQ=WEEKLY;INTERVAL=1',
    'monthly': 'FREQ=MONTHLY;INTERVAL=1',
    'every month': 'FREQ=MONTHLY;INTERVAL=1',
    'yearly': 'FREQ=YEARLY;INTERVAL=1',
    'every year': 'FREQ=YEARLY;INTERVAL=1',
    'every monday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO',
    'every tuesday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=TU',
    'every wednesday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=WE',
    'every thursday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=TH',
    'every friday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=FR',
    'every saturday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=SA',
    'every sunday': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=SU',
    'weekdays': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR',
    'weekends': 'FREQ=WEEKLY;INTERVAL=1;BYDAY=SA,SU',
  };
  //@ts-ignore
  return recurrenceMap[normalizedInput] || input;
}

program
  .name("calendar-cli")
  .description("CLI to create calendar events with recurrence patterns")
  .version("1.0.0");

program
  .command("create-event")
  .description("Create a new calendar event")
  .action(async () => {
    console.log("\n📅 Welcome to the Calendar Event Creator! 📅\n");
    console.log("You can enter dates in various formats like 'today', 'tomorrow', '2024-01-13', '01/13/2024', 'January 13, 2024'");
    console.log("For time, you can use '2:30 PM', '14:30', or just skip it for all-day events");
    console.log("For duration, you can type '2 hours', '90 minutes', or just '60' for minutes\n");

    try {
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "title",
          message: "What's the event title?",
          validate: (input) =>
            input.trim() !== "" ? true : "Title cannot be empty.",
        },
        {
          type: "confirm",
          name: "isAllDay",
          message: "Is this an all-day event?",
          default: false,
        },
        {
          type: "input",
          name: "startDate",
          message: "When does the event start?",
          default: "today",
          validate: (input) => {
            try {
              parseFlexibleDate(input);
              return true;
            } catch (error) {
              return "Please enter a valid date";
            }
          },
        },
        {
          type: "input",
          name: "startTime",
          message: "What time does it start? (skip for all-day events)",
          when: (answers) => !answers.isAllDay,
          default: "9:00 AM",
          validate: (input) => {
            try {
              const testDate = parse(input, 'h:mm a', new Date());
              return isValid(testDate) ? true : "Please enter a valid time";
            } catch (error) {
              return "Please enter a valid time";
            }
          },
        },
        {
          type: "input",
          name: "duration",
          message: "How long is the event? (e.g., '2 hours', '90 minutes', or just '60' for minutes)",
          when: (answers) => !answers.isAllDay,
          default: "1 hour",
          validate: (input) => {
            try {
              parseDuration(input);
              return true;
            } catch (error) {
              return "Please enter a valid duration";
            }
          },
        },
        {
          type: "input",
          name: "endTime",
          message: "When does the automation should stop?",
          when: (answers) => !answers.isAllDay,
          default: "2100-01-01 23:59",
        },
        {
          type: "confirm",
          name: "isRecurring",
          message: "Should this event repeat?",
          default: false,
        },
        {
          type: "input",
          name: "recurrencePattern",
          message: "How often should it repeat? (e.g., 'daily', 'weekly', 'every monday', 'weekdays')",
          when: (answers) => answers.isRecurring,
          validate: (input) => input.trim() !== "" ? true : "Please specify a recurrence pattern",
        },
      ]);

      // Process the start date and time
      let startDate = parseFlexibleDate(answers.startDate);
      if (!answers.isAllDay && answers.startTime) {
        const timeDate = parse(answers.startTime, 'h:mm a', new Date());
        startDate.setHours(timeDate.getHours(), timeDate.getMinutes());
      }

      // Calculate end date based on duration or set to end of day for all-day events
      let endDate = parseFlexibleDate(answers.endTime);
      if (!answers.isAllDay) {
        endDate = addMinutes(startDate, parseDuration(answers.duration));
      } else {
        endDate.setHours(23, 59, 59, 999);
      }
      // Connect to the database
      // await connectToDatabase

      // Save the event to the database
      const event = new CalendarEvent({
        EventId: uuidv4(),
        Title: answers.title,
        StartDateUtc: formatISO(startDate),
        EndDateUtc: formatISO(endDate),
        IsAllDay: answers.isAllDay,
        Duration: answers.isAllDay ? 1440 : parseDuration(answers.duration), // 1440 minutes = 24 hours
        IsRecurring: answers.isRecurring,
        RecurrencePattern: answers.isRecurring
          ? parseRecurrencePattern(answers.recurrencePattern)
          : null,
      });

      await event.save();

      console.log("\n✅ Event created successfully!");
      console.log("\nEvent Details:");
      const eventDetails = event.toObject();
      console.log(`Title: ${eventDetails.Title}`);
      console.log(`Start: ${new Date(eventDetails.StartDateUtc).toLocaleString()}`);
      console.log(`End: ${new Date(eventDetails.EndDateUtc).toLocaleString()}`);
      console.log(`All Day: ${eventDetails.IsAllDay ? 'Yes' : 'No'}`);
      console.log(`Duration: ${eventDetails.Duration} minutes`);
      if (eventDetails.IsRecurring) {
        console.log(`Recurrence: ${eventDetails.RecurrencePattern}`);
      }
    } catch (error) {
      console.error("\n❌ Error saving event to database:", error);
    } finally {
      mongoose.connection.close();
    }
  });

program.parse(process.argv);