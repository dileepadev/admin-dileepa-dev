import { EventsList } from "./events-list";

export default function EventsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Events</h1>
        <p className="text-muted-foreground">
          Update your upcoming and past events, talks, and appearances.
        </p>
      </div>

      <EventsList />
    </div>
  );
}
