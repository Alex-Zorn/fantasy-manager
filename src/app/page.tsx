import { DraftProvider } from "@/context/DraftContext";
import { DraftApp } from "@/components/DraftApp";

export default function Home() {
  return (
    <DraftProvider>
      <div className="flex min-h-0 flex-1 flex-col">
        <DraftApp />
      </div>
    </DraftProvider>
  );
}
