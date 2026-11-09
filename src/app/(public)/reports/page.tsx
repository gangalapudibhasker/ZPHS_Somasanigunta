import ReportsAndSheetsHub from "@/components/ReportsAndSheetsHub";

export default function PublicReportsPage() {
  return (
    <div className="container" style={{ padding: "2rem 0" }}>
      <ReportsAndSheetsHub isAdmin={false} />
    </div>
  );
}
