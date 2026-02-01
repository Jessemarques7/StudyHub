// components/SidebarDemo.tsx
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarLink, SidebarBody } from "./ui/aceternity-sidebar";
import { motion } from "framer-motion"; // Note: verify import 'motion/react' vs 'framer-motion'
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import {
  IconCards,
  IconChartDots3,
  IconFile,
  IconSitemap,
} from "@tabler/icons-react";

const links = [
  {
    label: "Notes",
    icon: (
      <IconFile className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    href: "/notes",
  },
  {
    label: "Flashcards",
    icon: (
      <IconCards className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    href: "/flashcards",
  },
  {
    label: "Canvas",
    icon: (
      <IconSitemap className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    href: "/diagram",
  },
  {
    label: "Graph",
    icon: (
      <IconChartDots3 className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
    ),
    href: "/graph",
  },
];

export function SidebarPages({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200  md:flex-row dark:border-neutral-700 ",
        "h-screen",
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div></div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}
// ... Logo e LogoIcon permanecem iguais
export const Logo = () => {
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <div className="h-8 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm ">
        <Image alt="logo" width={50} height={50} src={"/logo.png"} />
      </div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white "
      >
        StudyHub
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1  text-sm font-normal text-black"
    >
      <div className="h-8 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm ">
        <Image alt="logo" width={50} height={50} src={"/logo.png"} />
      </div>
    </Link>
  );
};
