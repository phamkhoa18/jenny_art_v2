import type { Metadata } from "next";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/config`, {
      next: { revalidate: 60 }, // cache 60s cho SEO meta
    });

    if (!res.ok) {
      throw new Error("Không fetch được config");
    }

    const { data } = await res.json();
    console.log(data);
    

return {
  title: {
    default: data?.siteName || "JennyPham.com.au",
    template: `%s | ${data?.siteName || "JennyPham.com.au"}`,
  },
  description:
    data?.description ||
    "JennyPham.com.au – Fine art, murals, sculptures & premium decor. Bringing creativity and elegance into your living space.",
  keywords: data?.keywords || [
    "fine art",
    "murals",
    "sculptures",
    "art decor",
    "Jenny Pham",
    "contemporary art",
  ],
  authors: [{ name: data?.siteName || "JennyPham.com.au" }],
  creator: data?.siteName || "JennyPham.com.au",
  publisher: data?.siteName || "JennyPham.com.au",
  openGraph: {
    title: data?.siteName || "JennyPham.com.au",
    description:
      data?.description ||
      "Discover unique fine art, murals, sculptures and premium decor at JennyPham.com.au.",
    url: data?.url || "https://jennypham.com.au",
    siteName: data?.siteName || "JennyPham.com.au",
    // images: [
    //   {
    //     url: data?.ogImage || "/default-og.png",
    //     width: 1200,
    //     height: 630,
    //     alt: data?.siteName || "JennyPham.com.au",
    //   },
    // ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: data?.siteName || "JennyPham.com.au",
    description:
      data?.description ||
      "JennyPham.com.au – Fine art, murals, sculptures & luxury art decor.",
    // images: [data?.ogImage || "/default-og.png"],
    creator: "@JennyPham",
  },
  icons: {
    icon: data?.favicon || "/favicon.ico",
    shortcut: data?.favicon || "/favicon.ico",
  },
  manifest: "/site.webmanifest",
  category: "art",
};

  } catch (err) {
    console.error("SEO config error:", err);
    return {
      title: "JennyPham.com.au",
      description: "JennyPham.com.au – Fine art, murals, sculptures & premium decor. Bringing creativity and elegance into your living space.",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="FZ Poppins antialiased bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
