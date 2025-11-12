import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata = {
  title: "Daily Manifesto",
  description:
    "Write and share your daily intentions with the world. Express your truth, track your journey, and inspire others.",
  manifest: "/manifest.json",
  keywords: [
    "daily manifesto",
    "manifesto",
    "daily intentions",
    "self-improvement",
    "personal growth",
    "motivation",
    "inspiration",
    "journaling",
    "productivity",
  ],
  authors: [{ name: "Daily Manifesto" }],
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-512x512.png",
  },
  openGraph: {
    title: "Daily Manifesto",
    description:
      "Write and share your daily intentions with the world. Express your truth, track your journey, and inspire others.",
    siteName: "Daily Manifesto",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daily Manifesto preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Manifesto",
    description:
      "Write and share your daily intentions with the world. Express your truth, track your journey, and inspire others.",
    images: ["/og-image.png"],
  },
};


export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
