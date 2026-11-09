import EventsAndDonorsView from "@/components/EventsAndDonorsView";

export default function PublicEventsPage() {
  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <EventsAndDonorsView isAdmin={false} initialTab="EVENTS" />
    </div>
  );
}
