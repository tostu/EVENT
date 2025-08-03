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
              <img
                class="size-10 rounded-box"
                src="https://img.daisyui.com/images/profile/demo/1@94.webp"
              />
            </div>
            <div>
              <div>{event.title}</div>
              <div class="text-xs uppercase font-semibold opacity-60">
                {event.description}
              </div>
            </div>
            <button class="btn btn-square btn-ghost">
              <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M6 3L20 12 6 21 6 3z"></path>
                </g>
              </svg>
            </button>
            <button class="btn btn-square btn-ghost">
              <svg
                class="size-[1.2em]"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <g
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z">
                  </path>
                </g>
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
