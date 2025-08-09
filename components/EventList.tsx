export default function EventList({ events }: { events: any[] }) {
  return (
    <ul class="list bg-base-100 rounded-box shadow-md">
      {events.map((event) => (
        <li class="list-row flex" key={event.id}>
          <div class="flex flex-col w-full gap-1">
            <a
              href={event.sourceUrl}
              className="flex flex-col w-full justify-between"
            >
              <h2>{event.title}</h2>
            </a>
            <div class="flex items-center gap-2">
              <span class="icon-[tabler--calendar]"></span>
              <div class="text-xs uppercase font-semibold opacity-60">
                {event.date.length === 1
                  ? event.date[0]?.toLocaleDateString()
                  : event.date[0]?.toLocaleDateString() + " - " +
                    event.date[event.date.length - 1]?.toLocaleDateString()}
              </div>
            </div>

            {event.location && (
              <div class="flex items-center gap-2">
                <span class="icon-[tabler--map]"></span>
                <span class="text-xs uppercase font-semibold opacity-60">
                  {event.location}
                </span>
              </div>
            )}

            {event.time && (
              <div class="flex items-center gap-2">
                <span class="icon-[tabler--clock]"></span>
                <span class="text-xs uppercase font-semibold opacity-60">
                  {event.time.start && event.time.end
                    ? `${event.time.start} - ${event.time.end}`
                    : event.time}
                </span>
              </div>
            )}

            <span class="badge badge-primary badge-md flex items-center mt-2">
              <img
                src={"https://" + new URL(event.sourceUrl).hostname +
                  "/favicon.ico"}
                alt={event.title}
                className="h-full w-auto"
              />
              {new URL(event.sourceUrl).hostname}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
