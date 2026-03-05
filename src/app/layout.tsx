import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://rightclickcomputerdigitals.com"),
  title: {
    default: "RIGHTCLICK COMPUTER DIGITALS — We give you options.",
    template: "%s | RIGHTCLICK COMPUTER DIGITALS",
  },
  description: "Your one-stop destination for computers, laptops, accessories, and professional repair services in Ghana. Quality products, competitive prices, and excellent customer service.",
  keywords: ["computers", "laptops", "accessories", "computer repair", "Ghana", "Accra", " RightClick", "computer sales", "laptop prices", "tech store"],
  authors: [{ name: "RIGHTCLICK COMPUTER DIGITALS" }],
  creator: "RIGHTCLICK COMPUTER DIGITALS",
  publisher: "RIGHTCLICK COMPUTER DIGITALS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "https://rightclickcomputerdigitals.com",
    siteName: "RIGHTCLICK COMPUTER DIGITALS",
    title: "RIGHTCLICK COMPUTER DIGITALS — We give you options.",
    description: "Your one-stop destination for computers, laptops, accessories, and professional repair services in Ghana.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "RIGHTCLICK COMPUTER DIGITALS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RIGHTCLICK COMPUTER DIGITALS",
    description: "Your one-stop destination for computers, laptops, accessories, and professional repair services.",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/logo-icon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
