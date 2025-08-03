import Event, { EventHydratedDocument } from "../model/Event.ts";

/**
 * Get paginated events sorted by parsed date
 */
export async function getEventsByDay(
  day: Date,
  page = 1,
  limit = 10,
): Promise<EventHydratedDocument[]> {
  // Create start and end of the day
  const startOfDay = new Date(day);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(day);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return await Event.find({
    date: {
      $elemMatch: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    },
  })
    .sort({ date: 1 })
    .skip(Math.max((page - 1) * limit, 0))
    .limit(limit)
    .maxTimeMS(10000);
}
