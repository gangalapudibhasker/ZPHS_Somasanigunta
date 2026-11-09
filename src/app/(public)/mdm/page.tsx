import MdmAndStaffView from "@/components/MdmAndStaffView";

export default function PublicMdmAndStaffPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <MdmAndStaffView isAdmin={false} initialTab="MDM" />
    </div>
  );
}

