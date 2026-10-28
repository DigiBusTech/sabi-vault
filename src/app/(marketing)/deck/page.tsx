import type { Metadata } from "next";
import { PitchDeckViewer } from "@/components/deck/PitchDeckViewer";

export const metadata: Metadata = {
  title: "Investor Pitch Deck — SabiProfile Sovereign Identity Protocol",
  description:
    "Interactive investor pitch deck and downloadable PDF presentation for SabiProfile: the sovereign data infrastructure replacing credential fraud with cryptographic on-chain verification.",
  openGraph: {
    title: "SabiProfile Investor Pitch Deck (Seed Round)",
    description:
      "Sovereign data infrastructure for cross-border immigration, higher education, and enterprise hiring.",
    url: "https://www.sabiprofile.com/deck",
  },
};

export default function PitchDeckPage() {
  return (
    <div className="w-full bg-[#f8fafc] min-h-screen">
      <PitchDeckViewer />
    </div>
  );
}
