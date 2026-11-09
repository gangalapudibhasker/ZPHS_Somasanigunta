import React from "react";
import StudentActivitiesView from "@/components/StudentActivitiesView";

export const revalidate = 0;

export default function PublicStudentActivitiesPage() {
  return (
    <div className="container" style={{ paddingTop: "2.5rem" }}>
      <StudentActivitiesView isAdmin={false} />
    </div>
  );
}

