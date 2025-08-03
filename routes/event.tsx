import { Handlers, PageProps } from "$fresh/server.ts";
import { getEventsByDay } from "../service/eventService.ts";
import DatePicker from "../islands/DatePicker.tsx";

interface Data {
  selectedDate: string;
  events: any[]; // Replace 'any' with your actual event type
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    // Use the date from query param or default to today
    const selectedDate = dateParam || new Date().toDateString();

    // Parse the date for the service call
    const dateForService = dateParam ? new Date(dateParam) : new Date();
    console.log(dateForService);
    const events = await getEventsByDay(dateForService, 0, 20);

    return await ctx.render({ selectedDate, events });
  },
};

export default function EventsPage({ data }: PageProps<Data>) {
  const { selectedDate, events } = data;

  return (
    <>
      <form method="GET" className="flex w-full justify-between">
        <DatePicker initialValue={selectedDate} />
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
      <ul class="list bg-base-100 rounded-box shadow-md">
        <li class="p-4 pb-2 text-xs opacity-60 tracking-wide">
          Most played songs this week
        </li>
        {events.map((event) => (
          <li class="list-row" key={event.id}>
            <div>
              <div>{event.title}</div>
              <div class="text-xs uppercase font-semibold opacity-60">
                {event.date.length === 1
                  ? event.date[0]?.toLocaleDateString()
                  : event.date[0]?.toLocaleDateString() + " - " +
                    event.date[event.date.length - 1]?.toLocaleDateString()}
              </div>
              <div class="text-xs uppercase font-semibold opacity-60">
                {event.time || ""}
              </div>
              <div class="text-xs uppercase font-semibold opacity-60">
                {event.location || ""}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
