import EventsAndDonorsView from "@/components/EventsAndDonorsView";

export default function AdminEventsPage() {
  return <EventsAndDonorsView isAdmin={true} initialTab="EVENTS" />;
}

