const mongoose = require('mongoose');

// Define the schema for the calendar event
const calendarEventSchema = new mongoose.Schema({
  EventId: { type: String, required: true, unique: true },
  Title: { type: String, required: true },
  StartDateUtc: { type: Date, required: true },
  EndDateUtc: { type: Date, required: true },
  IsAllDay: { type: Boolean, required: true },
  Duration: { type: Number, required: true },
  IsRecurring: { type: Boolean, required: true },
  RecurrencePattern: { type: String, default: null },
});

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

export async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/calendarDB', {
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}
