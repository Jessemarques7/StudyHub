// components/SidebarDemo.tsx
"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody } from "./ui/aceternity-sidebar";
import { motion } from "framer-motion"; // Note: verify import 'motion/react' vs 'framer-motion'
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import NotesList from "./notes/NotesList";
import DiagramsList from "./diagram/DiagramsList"; // Importar
import { IconCards, IconFile, IconSitemap } from "@tabler/icons-react";
import { LogoutButton } from "./auth/LogoutButton";

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-slate-900",
        "h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}

            <div className="mt-8 flex flex-col gap-2">
              {/* Notas */}
              <div className="flex items-start">
                <Link
                  href="/notes"
                  className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
                >
                  <div className="h-8 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm">
                    <IconFile className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  </div>
                </Link>
                <NotesList opensidebar={open} />
              </div>

              {/* Flashcards (Mantido como estava) */}
              <Link href="/flashcards" className="flex items-start ">
                <div className="relative z-20 flex items-center space-x-2 py-1  text-sm font-normal text-black">
                  <div className="h-8 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm ">
                    <IconCards className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />{" "}
                  </div>
                </div>
                <motion.span className="flex items-center justify-between w-full text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-blue-900/30 rounded-md px-2 py-2 transition-colors">
                  Flashcards
                </motion.span>
              </Link>

              {/* Diagramas - Alterado para usar DiagramsList */}
              <div className="flex items-start">
                <Link
                  href="/diagram"
                  className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
                >
                  <div className="h-8 w-8 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm">
                    <IconSitemap className="h-6 w-6 m-1 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  </div>
                </Link>
                <DiagramsList opensidebar={open} />
              </div>
            </div>
            <LogoutButton />
          </div>
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
