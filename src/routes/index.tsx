import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Landing } from "@/components/pucham/Landing";
import { ChatPanel } from "@/components/pucham/ChatPanel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PUCHAM AI — Manglish Roasting AI Chatbot" },
      {
        name: "description",
        content:
          "Chodikku mone... judge cheyyan njangal ready aanu. PUCHAM AI roasts your excuses, exam panic, diet promises and thallu in Manglish.",
      },
      { property: "og:title", content: "PUCHAM AI — Manglish Roasting AI" },
      {
        property: "og:description",
        content:
          "Sarcasm Engine: ONLINE. Thallu Detector: ACTIVE. Get roasted in Manglish by a sarcastic Malayali AI friend.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [entered, setEntered] = useState(false);
  return entered ? <ChatPanel /> : <Landing onEnter={() => setEntered(true)} />;
}
