import AcademicsAndExamsView from "@/components/AcademicsAndExamsView";

export default function PublicTimetablePage() {
  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <AcademicsAndExamsView isAdmin={false} initialTab="TIMETABLE" />
    </div>
  );
}
