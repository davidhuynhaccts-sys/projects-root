import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project aMpersand | Menopause & More",
  description:
    "Project aMpersand is a movement for menopause awareness, education, and support. #AndStill",
};

export default function AmpersandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
