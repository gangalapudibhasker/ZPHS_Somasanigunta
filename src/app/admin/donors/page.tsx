import EventsAndDonorsView from "@/components/EventsAndDonorsView";

export default function AdminDonorsPage() {
  return <EventsAndDonorsView isAdmin={true} initialTab="DONORS" />;
}

