import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "شركة أفياء للزراعة والتشجير",
  description:
    "شركة أفياء - رواد في مجال التطوير الزراعي والتشجير في المملكة العربية السعودية",
  keywords: ["أفياء", "زراعة", "تشجير", "مشاريع زراعية", "السعودية"],
  openGraph: {
    title: "شركة أفياء للزراعة والتشجير",
    description:
      "رواد في مجال التطوير الزراعي والتشجير في المملكة العربية السعودية",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="font-cairo antialiased bg-background text-foreground" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
