// models/Event.model.ts
import { z } from "zod";
import {
  Schema,
  model,
  Document,
  Model,
  HydratedDocument,
  Types,
  connect,
} from "mongoose";

connect("mongodb://root:password@localhost:27017/EVENT?authSource=admin")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define the Zod schema for an Event
export const EventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  // Zod can validate string as datetime, Mongoose will convert to Date for storage
  date: z.union([
    z.object({
      start: z.iso.datetime(
        "Invalid date format. Use ISO 8601 (e.g., '2023-01-01T12:00:00Z')",
      ),
      end: z.iso.datetime(
        "Invalid date format. Use ISO 8601 (e.g., '2023-01-01T12:00:00Z')",
      ),
    }),
    z.iso.datetime(
      "Invalid date format. Use ISO 8601 (e.g., '2023-01-01T12:00:00Z')",
    ),
  ]),
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
export type EventModel = Model<
  IEventDocument,
  {},
  IEventMethods,
  {},
  HydratedDocument<IEventDocument, IEventMethods>
> &
  IEventStatics;

// Define the Hydrated Document type for direct use
export type EventHydratedDocument = HydratedDocument<
  IEventDocument,
  IEventMethods
>;

const eventSchema = new Schema<IEventDocument, EventModel, IEventMethods>(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    // Date can be either a string or an object with start/end
    date: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: function (value: any) {
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
          "Date must be either a string or an object with start and end properties",
      },
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

// Add a custom static method
eventSchema.statics.findByTitle = async function (
  title: string,
): Promise<EventHydratedDocument | null> {
  return this.findOne({ title });
};

eventSchema.statics.getAllEventsWithPaging = async function (
  page: number,
  limit: number,
): Promise<EventHydratedDocument[]> {
  // We'll use aggregation pipeline to handle the complex sorting
  return this.aggregate(
    [
      {
        $addFields: {
          sortDate: {
            $switch: {
              branches: [
                {
                  // Case 1: date is a string
                  case: {
                    $and: [
                      { $eq: [{ $type: "$date" }, "string"] },
                      { $ne: ["$date", ""] },
                    ],
                  },
                  then: { $dateFromString: { dateString: "$date" } },
                },
                {
                  // Case 2: date is an object with start property that's a valid string
                  case: {
                    $and: [
                      { $eq: [{ $type: "$date" }, "object"] },
                      { $eq: [{ $type: "$date.start" }, "string"] },
                      { $ne: ["$date.start", ""] },
                    ],
                  },
                  then: { $dateFromString: { dateString: "$date.start" } },
                },
              ],
              // Default case: date is array, null, empty string, or invalid format
              default: new Date(0), // Use epoch date as fallback
            },
          },
        },
      },
      {
        $sort: { sortDate: 1 },
      },
      {
        $skip: Math.max((page - 1) * limit, 0),
      },
      {
        $limit: limit,
      },
      {
        $project: {
          sortDate: 0, // Remove the temporary field from results
        },
      },
    ],
    { maxTimeMS: 1000000 }, // Increased to 1000000 milliseconds (10 seconds)
  );
};

// Create the Mongoose Model
const Event = model<IEventDocument, EventModel>("Event", eventSchema, "events");

export default Event;
