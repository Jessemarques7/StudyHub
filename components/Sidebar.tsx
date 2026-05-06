// components/Sidebar.tsx
"use client";
import React from "react";
import { FloatingDock } from "./ui/floating-dock";
import {
  IconCalendarFilled,
  IconCards,
  IconFile,
  IconHome,
  IconTargetArrow,
} from "@tabler/icons-react";

const links = [
  {
    title: "Home",
    icon: <IconHome className="h-full w-full" />,
    href: "/",
  },
  {
    title: "Notes",
    icon: <IconFile className="h-full w-full" />,
    href: "/notes",
  },
  {
    title: "Flashcards",
    icon: <IconCards className="h-full w-full" />,
    href: "/flashcards",
  },
  {
    title: "Habits",
    icon: <IconTargetArrow className="h-full w-full" />,
    href: "/habits",
  },
  {
    title: "Calendar",
    icon: <IconCalendarFilled className="h-full w-full" />,
    href: "/calendar",
  },
];

export function SidebarPages({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      {/* Floating Dock rendering 
        We pass a mobileClassName to position the mobile button at bottom right
      */}
      <FloatingDock items={links} />

      {/* Main Content Area */}
      {/* Notice md:pl-28 adds space on desktop to avoid content clipping under the dock */}
      <div className="h-full w-full overflow-auto pb-[10vh] pt-4 md:pb-0 md:pt-0">
        {children}
      </div>
    </div>
  );
}
