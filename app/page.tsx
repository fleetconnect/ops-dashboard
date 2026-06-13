"use client";

import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { FixtureBanner } from "@/components/dashboard/fixture-banner";
import { SectionIntro } from "@/components/dashboard/section-intro";
import { MissionControl } from "@/components/dashboard/sections/mission-control";
import { ApprovalQueue } from "@/components/dashboard/sections/approval-queue";
import { Opportunities } from "@/components/dashboard/sections/opportunities";
import { Lineage } from "@/components/dashboard/sections/lineage";
import { WeeklyReviewSection } from "@/components/dashboard/sections/weekly-review";
import { AgentStatus } from "@/components/dashboard/sections/agent-status";
import { AgentPanel } from "@/components/dashboard/sections/agent-panel";
import { RecentNotes } from "@/components/dashboard/sections/recent-notes";
import { VaultSearch } from "@/components/dashboard/sections/search";
import { Projects } from "@/components/dashboard/sections/projects";
import { Goals } from "@/components/dashboard/sections/goals";
import { Conversations } from "@/components/dashboard/sections/conversations";
import { DailyNote } from "@/components/dashboard/sections/daily-note";
import { useEventStream } from "@/lib/use-event-stream";
import type { Section } from "@/lib/os";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState<Section>("agent-panel");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [lineageTarget, setLineageTarget] = useState<string | null>(null);
  const stream = useEventStream(60);

  const renderSection = () => {
    switch (activeSection) {
      case "agent-panel":
        return <AgentPanel stream={stream} />;
      case "mission-control":
        return <MissionControl stream={stream} />;
      case "approval-queue":
        return <ApprovalQueue />;
      case "opportunities":
        return (
          <Opportunities
            onWalkLineage={(id) => {
              setLineageTarget(id);
              setActiveSection("lineage");
            }}
          />
        );
      case "lineage":
        return <Lineage initialId={lineageTarget} />;
      case "weekly-review":
        return <WeeklyReviewSection />;
      case "agent-status":
        return <AgentStatus stream={stream} />;
      case "recent-notes":
        return <RecentNotes />;
      case "search":
        return <VaultSearch />;
      case "projects":
        return <Projects />;
      case "goals":
        return <Goals />;
      case "conversations":
        return <Conversations />;
      case "daily-note":
        return <DailyNote />;
      default:
        return <AgentPanel stream={stream} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        }`}
      >
        <Header activeSection={activeSection} streamStatus={stream.status} />
        <FixtureBanner events={stream.events} />
        <main className="flex-1 p-6 overflow-auto">
          <div key={activeSection} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <SectionIntro section={activeSection} />
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
