"use client";

import { useRef, useState, type ReactNode } from "react";
import type { EntityWithPublisher, StartHereWithArc } from "@/types";
import { SummaryTab } from "@/components/entity/tabs/SummaryTab";
import { TimelineTab } from "@/components/entity/tabs/TimelineTab";
import { AlliesTab } from "@/components/entity/tabs/AlliesTab";
import { EnemiesTab } from "@/components/entity/tabs/EnemiesTab";
import { MembersTab } from "@/components/entity/tabs/MembersTab";
import { MediaTab } from "@/components/entity/tabs/MediaTab";
import { BibliographyTab } from "@/components/entity/tabs/BibliographyTab";
import { cn } from "@/lib/ui/cn";

interface TabDef {
  id: string;
  label: string;
  render: () => ReactNode;
}

interface EntityTabsProps {
  entity: EntityWithPublisher;
  initialStartHere?: StartHereWithArc[];
}

export function EntityTabs({ entity, initialStartHere }: EntityTabsProps) {
  const slug = entity.slug;

  const tabs: TabDef[] = [
    { id: "summary", label: "Summary", render: () => <SummaryTab entity={entity} initialStartHere={initialStartHere} /> },
    { id: "timeline", label: "Timeline", render: () => <TimelineTab slug={slug} /> },
    ...(entity.entity_type === "team"
      ? [{ id: "members", label: "Members", render: () => <MembersTab slug={slug} /> }]
      : [
          { id: "allies", label: "Allies", render: () => <AlliesTab slug={slug} /> },
          { id: "enemies", label: "Enemies", render: () => <EnemiesTab slug={slug} /> },
        ]),
    { id: "media", label: "Media", render: () => <MediaTab slug={slug} /> },
    { id: "bibliography", label: "Bibliography", render: () => <BibliographyTab slug={slug} /> },
  ];

  const [active, setActive] = useState(tabs[0].id);
  const activeTab = tabs.find((t) => t.id === active) ?? tabs[0];
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const idx = tabs.findIndex((t) => t.id === active);
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    setActive(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div className="sticky top-14 z-30 -mx-4 mb-8 border-b border-border bg-bg/85 px-4 backdrop-blur-md sm:mx-0 sm:px-0">
        <div role="tablist" aria-label="Entity sections" onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto">
          {tabs.map((tab, i) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "relative shrink-0 px-3.5 py-3 text-sm font-medium transition-colors duration-150",
                  isActive ? "text-text-primary" : "text-text-secondary hover:text-text-primary",
                )}
              >
                {tab.label}
                {isActive ? (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accent" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab.id}`}
        aria-labelledby={`tab-${activeTab.id}`}
        tabIndex={0}
        className="min-h-[40vh] focus:outline-none"
      >
        {activeTab.render()}
      </div>
    </div>
  );
}
