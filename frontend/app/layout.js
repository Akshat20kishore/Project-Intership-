import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

export const metadata = {
  title: { default: "Vana Botanicals | Himalayan Skincare & Apothecary", template: "%s | Vana Botanicals" },
  description: "Pure botanical extracts, Ayurvedic skincare remedies, and artisanal wellness rituals.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#294432",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="page">{children}</main>
          <footer className="footer">
            Vana Botanicals Apothecary. Crafted with organic Himalayan flora. Simulated demo checkout.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
