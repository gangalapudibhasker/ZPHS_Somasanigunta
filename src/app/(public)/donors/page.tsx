import EventsAndDonorsView from "@/components/EventsAndDonorsView";

export default function PublicDonorsPage() {
  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <EventsAndDonorsView isAdmin={false} initialTab="DONORS" />
    </div>
  );
}
