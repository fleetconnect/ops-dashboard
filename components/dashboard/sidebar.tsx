"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { SECTION_TITLES, type Section } from "@/lib/os";
import {
  LayoutDashboard,
  ClipboardCheck,
  Target,
  GitBranch,
  FileBarChart,
  Network,
  ChevronLeft,
  ChevronRight,
  Activity,
  Bot,
  Clock,
  Search,
  FolderKanban,
  Flag,
  MessagesSquare,
  CalendarDays,
  Sunrise,
  Plug,
} from "lucide-react";

interface SidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

type NavItem = { id: Section; label: string; icon: React.ElementType };

// Two groups mirror the two data planes. Operations = Plane A live state; Knowledge = Plane B
// vault (read-only in Phase 1). Agent Panel leads as the default landing / front door.
const NAV_GROUPS: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Intelligence",
    items: [
      { id: "morning-brief", label: SECTION_TITLES["morning-brief"], icon: Sunrise },
      { id: "integrations", label: SECTION_TITLES["integrations"], icon: Plug },
    ],
  },
  {
    heading: "Operations",
    items: [
      { id: "agent-panel", label: SECTION_TITLES["agent-panel"], icon: Bot },
      { id: "mission-control", label: SECTION_TITLES["mission-control"], icon: LayoutDashboard },
      { id: "approval-queue", label: SECTION_TITLES["approval-queue"], icon: ClipboardCheck },
      { id: "opportunities", label: SECTION_TITLES["opportunities"], icon: Target },
      { id: "lineage", label: SECTION_TITLES["lineage"], icon: GitBranch },
      { id: "weekly-review", label: SECTION_TITLES["weekly-review"], icon: FileBarChart },
      { id: "agent-status", label: SECTION_TITLES["agent-status"], icon: Network },
    ],
  },
  {
    heading: "Knowledge",
    items: [
      { id: "search", label: SECTION_TITLES["search"], icon: Search },
      { id: "recent-notes", label: SECTION_TITLES["recent-notes"], icon: Clock },
      { id: "projects", label: SECTION_TITLES["projects"], icon: FolderKanban },
      { id: "goals", label: SECTION_TITLES["goals"], icon: Flag },
      { id: "conversations", label: SECTION_TITLES["conversations"], icon: MessagesSquare },
      { id: "daily-note", label: SECTION_TITLES["daily-note"], icon: CalendarDays },
    ],
  },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-out flex flex-col",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-accent/15">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <span
            className={cn(
              "font-semibold text-lg text-sidebar-foreground whitespace-nowrap transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}
          >
            Control Center
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="space-y-1">
            <p
              className={cn(
                "px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 transition-all duration-300",
                collapsed ? "opacity-0 h-0 overflow-hidden" : "opacity-100"
              )}
            >
              {group.heading}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent transition-all duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0 transition-transform duration-200",
                      isActive ? "text-accent" : "group-hover:scale-110"
                    )}
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap transition-all duration-300",
                      collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
