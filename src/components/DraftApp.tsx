"use client";

import { useDraft } from "@/context/DraftContext";
import { SetupPanel } from "@/components/SetupPanel";
import { DraftHeader } from "@/components/DraftHeader";
import { PlayerPool } from "@/components/PlayerPool";
import { BestAvailable } from "@/components/BestAvailable";
import { MyRoster } from "@/components/MyRoster";
import { PickLog } from "@/components/PickLog";

export function DraftApp() {
  const { state, hydrated } = useDraft();

  if (!hydrated) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
        Loading...
      </div>
    );
  }

  if (!state.started) {
    return (
      <div className="h-full overflow-auto">
        <SetupPanel />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <DraftHeader />
      <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_320px]">
        <div className="h-full min-h-0 overflow-hidden border-neutral-200 lg:border-r dark:border-neutral-800">
          <PlayerPool />
        </div>
        <div className="h-full min-h-0 divide-y divide-neutral-200 overflow-auto dark:divide-neutral-800">
          <BestAvailable />
          <MyRoster />
          <PickLog />
        </div>
      </div>
    </div>
  );
}
