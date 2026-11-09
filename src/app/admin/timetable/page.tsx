import AcademicsAndExamsView from "@/components/AcademicsAndExamsView";

export default function AdminTimetablePage() {
  return <AcademicsAndExamsView isAdmin={true} initialTab="TIMETABLE" />;
}

