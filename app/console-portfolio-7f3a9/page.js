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
    <main className="admin-page">
      <div className="admin-shell">
        <div className="admin-intro">
          <span className="section-kicker">لوحة الإدارة</span>
          <h1>ربط حساب Vercel وتحديث بيانات البورتفوليو</h1>
          <p>
            هذه الصفحة غير مرتبطة من الواجهة العامة. بعد الدخول ستتمكن من حفظ التوكن،
            اختيار الفريق، وتخصيص النصوص العربية الظاهرة في الصفحة الرئيسية.
          </p>
        </div>

        <AdminDashboard
          initialAuthorized={initialAuthorized}
          initialState={initialState}
        />
      </div>
    </main>
  );
}
