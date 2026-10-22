import Providers from "./providers";
import DashboardLayoutContent from "@/components/DashboardLayoutContent";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Providers>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Providers>
      </body>
    </html>
  );
}