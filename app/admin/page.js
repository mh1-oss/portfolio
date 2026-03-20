import AdminDashboard from "@/components/admin-dashboard";
import { requireAdminSession } from "@/lib/admin-auth";
import { getSanitizedConfig } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminPage() {
  const initialAuthorized = await requireAdminSession();
  const initialState = initialAuthorized ? await getSanitizedConfig() : null;

  return (
    <main style={{ width: '100%', minHeight: '100vh' }}>
      <AdminDashboard
        initialAuthorized={initialAuthorized}
        initialState={initialState}
      />
    </main>
  );
}
