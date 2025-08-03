// models/Event.model.ts
import { z } from "zod";
import {
  Document,
  HydratedDocument,
  Model,
  model,
  Schema,
  Types,
} from "mongoose";

// Define the Zod schema for an Event
export const EventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  // Zod can validate string as datetime, Mongoose will convert to Date for storage
  date: z.array(
    z.iso.datetime(
      "Invalid date format. Use ISO 8601 (e.g., '2023-01-01T12:00:00Z')",
    ),
  ),
  time: z
    .union([
      z.object({
        start: z.iso.time(
          "Invalid time format. Use ISO 8601 (e.g., '12:00:00')",
        ),
        end: z.iso.time("Invalid time format. Use ISO 8601 (e.g., '12:00:00')"),
      }),
      z.iso.time("Invalid time format. Use ISO 8601 (e.g., '12:00:00')"),
    ])
    .optional(),
  location: z.string().min(3, "Location must be at least 3 characters long"),
  sourceUrl: z.url("Invalid URL format"),
});

// Define the Zod schema for creating a new Event (often same as base)
export const CreateEventSchema = EventSchema;

// Define the Zod schema for updating an Event (all fields optional)
export const UpdateEventSchema = EventSchema.partial();

// --- 2. TypeScript Interfaces ---

// Infer the raw document type from the Zod schema
// This represents the data shape in MongoDB *before* Mongoose adds its methods
export type IEvent = z.infer<typeof EventSchema>;

// Define custom instance methods (if any)
interface IEventMethods {
  getEventDetails(): string;
}

// Define the Mongoose document interface
// This extends the raw document with Mongoose's Document properties (_id, etc.)
// and includes custom instance methods.
interface IEventDocument extends IEvent, Document, IEventMethods {
  _id: Types.ObjectId; // Explicitly define _id type for clarity
  createdAt: Date;
  updatedAt: Date;
}

// Define custom static methods (if any)
interface IEventStatics extends Model<IEventDocument, {}, IEventMethods> {
  findByTitle(
    title: string,
  ): Promise<HydratedDocument<IEventDocument, IEventMethods> | null>;
  getAllEventsWithPaging(
    page: number,
    limit: number,
  ): Promise<HydratedDocument<IEventDocument, IEventMethods>[]>;
}

// Define the full Mongoose Model type
export type EventModel =
  & Model<
    IEventDocument,
    {},
    IEventMethods,
    {},
    HydratedDocument<IEventDocument, IEventMethods>
  >
  & IEventStatics;

// Define the Hydrated Document type for direct use
export type EventHydratedDocument = HydratedDocument<
  IEventDocument,
  IEventMethods
>;

const eventSchema = new Schema<IEventDocument, EventModel, IEventMethods>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    // Date is an array of Date objects
    date: {
      type: [Date],
      required: true,
    },
    // Time can be either a string or an object with start/end (optional)
    time: {
      type: Schema.Types.Mixed,
      required: false,
      validate: {
        validator: function (value: any) {
          // If value is undefined/null, it's valid (optional field)
          if (value === undefined || value === null) return true;

          // Validate that it's either a string or an object with start/end
          return (
            typeof value === "string" ||
            (typeof value === "object" &&
              value !== null &&
              typeof value.start === "string" &&
              typeof value.end === "string")
          );
        },
        message:
          "Time must be either a string or an object with start and end properties",
      },
    },
    location: { type: String, required: true },
    sourceUrl: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  },
);

// // Add a custom instance method
// eventSchema.methods.getEventDetails = function (
//   this: Document<unknown, {}, IEventDocument, {}, {}> & IEventMethods,
// ): string {
//   return `Event: ${this.title} on ${new Date(this.date).toDateString()} at ${this.location}`;
// };

// Create the Mongoose Model
const Event = model<IEventDocument, EventModel>("Event", eventSchema, "events");
export default Event;
