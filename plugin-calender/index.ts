import { Service, ServiceBroker } from "moleculer";
import mongoose from "mongoose";
import { CalendarEvent, connectToDatabase } from "../model";
import { v4 as uuidv4 } from 'uuid';
import { parse, isValid, formatISO, addMinutes } from 'date-fns';

class CalendarService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);

    this.parseServiceSchema({
      name: "calendar",
      version: 1,
      actions: {
        createEvent: this.createEvent,
        parseFlexibleDate: this.parseFlexibleDate,
        parseDuration: this.parseDuration,
        parseRecurrencePattern: this.parseRecurrencePattern,
      },
    });
  }
  //@ts-ignore
  async createEvent(ctx) {
    const { title, startDate, duration, recurrencePattern } = ctx.params;
    const eventId = uuidv4();
    const startDateUtc = formatISO(new Date(startDate));
    const endDateUtc = formatISO(addMinutes(new Date(startDate), duration));
    const isAllDay = false;
    const isRecurring = !!recurrencePattern;

    const event = new CalendarEvent({
      eventId,
      title,
      startDateUtc,
      endDateUtc,
      isAllDay,
      duration,
      isRecurring,
      recurrencePattern,
    });

    await event.save();
    return { success: true, event };
  }
  //@ts-ignore
  parseFlexibleDate(ctx) {
    const input = ctx.params.input;
    const normalizedInput = input.toLowerCase().trim();

    if (normalizedInput === 'today') {
      return new Date();
    }
    if (normalizedInput === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    const dateFormats = [
      'yyyy-MM-dd',
      'MM/dd/yyyy',
      'MM-dd-yyyy',
      'MMMM d, yyyy',
      'MMM d, yyyy',
      'MM/dd/yyyy HH:mm',
      'yyyy-MM-dd HH:mm',
      'MM/dd/yyyy h:mm a',
    ];

    for (const format of dateFormats) {
      const parsedDate = parse(input, format, new Date());
      if (isValid(parsedDate)) {
        return parsedDate;
      }
    }

    throw new Error('Invalid date format');
  }
  //@ts-ignore
  parseDuration(ctx) {
    const input = ctx.params.input;
    const normalizedInput = input.toLowerCase().trim();

    const hourMatch = normalizedInput.match(/(\d+)\s*(?:hour|hr|h)/);
    const minuteMatch = normalizedInput.match(/(\d+)\s*(?:minute|min|m)/);

    let totalMinutes = 0;

    if (hourMatch) {
      totalMinutes += parseInt(hourMatch[1], 10) * 60;
    }
    if (minuteMatch) {
      totalMinutes += parseInt(minuteMatch[1], 10);
    }

    if (!hourMatch && !minuteMatch && /^\d+$/.test(normalizedInput)) {
      totalMinutes = parseInt(normalizedInput, 10);
    }

    if (totalMinutes <= 0) {
      throw new Error('Invalid duration');
    }

    return totalMinutes;
  }
  //@ts-ignore
  parseRecurrencePattern(ctx) {
    const input = ctx.params.input;
    const normalizedInput = input.toLowerCase().trim();

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
}

export default CalendarService;