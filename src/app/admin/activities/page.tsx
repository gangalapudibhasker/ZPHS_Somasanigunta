import React from "react";
import StudentActivitiesView from "@/components/StudentActivitiesView";

export const revalidate = 0;

export default function AdminStudentActivitiesPage() {
  return <StudentActivitiesView isAdmin={true} />;
}

