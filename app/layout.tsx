import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ConfigProvider } from "@/lib/config-context";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "App de Alfabetización — Esc. Helen Keller",
  description:
    "Actividades de lectura y escritura para niños de primaria. Accesible para baja visión y ciegos. Escuela N° 2-006 Helen Keller, Mendoza.",
  keywords: ["alfabetización", "lectura", "escritura", "niños", "accesible", "NVDA"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={nunito.variable}>
      <body className={nunito.className}>
        <ConfigProvider>{children}</ConfigProvider>
      </body>
    </html>
  );
}
