import "./globals.css";

export const metadata = {
  title: "بورتفوليو عربي متصل بـ Vercel",
  description: "واجهة عربية حديثة تعرض مشاريع Vercel تلقائياً من خلال لوحة أدمن مخفية."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
