import type { Metadata } from "next";
import { Inter, Libre_Baskerville, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/auth/ConvexClientProvider";
import { AudioSovereignProvider, AudioSovereignControl } from "@/components/narrative/AudioSovereign";
import { CopilotKit } from "@copilotkit/react-core";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  weight: ["400", "700"],
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-libre",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Luminous Deep",
  description: "A calm, coastal interactive story.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${libreBaskerville.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        <style>{`
          .copilotKitPopup {
            display: none !important;
          }
        `}</style>
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          publicApiKey={process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_KEY}
          showDevConsole={false}
        >
          <ConvexClientProvider>
            <AudioSovereignProvider>
              <AudioSovereignControl />
              {children}
            </AudioSovereignProvider>
          </ConvexClientProvider>
        </CopilotKit>
      </body>
    </html>
  );
}
