import { Handlers, PageProps } from "$fresh/server.ts";
import { getEventsByDay } from "../service/eventService.ts";
import DatePicker from "../islands/DatePicker.tsx";
import EventList from "../components/EventList.tsx";

interface Data {
  selectedDate: string;
  events: any[];
  currentPage: number;
  hasMore: boolean;
}

export const handler: Handlers<Data> = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");
    const pageParam = url.searchParams.get("page");

    // Use the date from query param or default to today
    const selectedDate = dateParam || new Date().toDateString();

    // Parse the date for the service call
    const dateForService = dateParam ? new Date(dateParam) : new Date();

    // Parse page number, default to 1
    const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = 20;
    const offset = (currentPage - 1) * pageSize;

    console.log(dateForService);
    const { events, hasMore } = await getEventsByDay(
      dateForService,
      offset,
      pageSize,
    );

    return await ctx.render({ selectedDate, events, currentPage, hasMore });
  },
};

export default function EventsPage({ data, url }: PageProps<Data>) {
  const { selectedDate, events, currentPage, hasMore } = data;

  const createPageUrl = (page: number) => {
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.set("page", page.toString());
    return `?${searchParams.toString()}`;
  };

  const nextDayUrl = () => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const searchParams = new URLSearchParams(url.searchParams);
    searchParams.set("date", nextDate.toDateString());
    searchParams.set("page", "1");
    return `?${searchParams.toString()}`;
  };

  return (
    <div class="layout flex flex-col min-h-screen">
      <div class="navbar bg-base-100 shadow-sm sticky top-0 z-10">
        <a class="btn btn-ghost text-xl">EVENT</a>
        <form method="GET" className="flex w-full justify-between">
          <DatePicker initialValue={selectedDate} />
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>
      <div className="flex flex-col gap-4 container mx-auto">
        <EventList events={events} />
        <div className="flex justify-center">
          {hasMore
            ? (
              <div class="join">
                <a
                  href={createPageUrl(Math.max(1, currentPage - 1))}
                  class={`join-item btn ${
                    currentPage === 1 ? "btn-disabled" : ""
                  }`}
                >
                  «
                </a>
                <button disabled type="button" class="join-item btn">
                  Page {currentPage}
                </button>
                <a
                  href={createPageUrl(currentPage + 1)}
                  class={`join-item btn ${hasMore ? "" : "btn-disabled"}`}
                >
                  »
                </a>
              </div>
            )
            : (
              <a href={nextDayUrl()} className="join-item btn btn-primary">
                Next Day
              </a>
            )}
        </div>
      </div>
    </div>
  );
}
