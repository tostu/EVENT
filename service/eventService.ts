import Event, { EventHydratedDocument } from "../model/Event.ts";

interface EventsPage {
  events: EventHydratedDocument[];
  hasMore: boolean;
}

/**
 * Get paginated events sorted by parsed date
 */
export async function getEventsByDay(
  day: Date,
  page = 1,
  limit = 10,
): Promise<EventsPage> {
  // Create start and end of the day
  const startOfDay = new Date(day);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(day);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const query = {
    date: {
      $elemMatch: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    },
  };

  // Fetch one extra item to check if there are more
  const events = await Event.find(query)
    .sort({ date: 1 })
    .skip(Math.max((page - 1) * limit, 0))
    .limit(limit + 1) // Fetch one extra
    .maxTimeMS(10000);

  // Check if we have more items than requested
  const hasMore = events.length > limit;

  // Remove the extra item if it exists
  if (hasMore) {
    events.pop();
  }

  return {
    events,
    hasMore,
  };
}
