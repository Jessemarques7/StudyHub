"use client";

import { useState } from "react";

import Editor from "@/components/notes/Editor";
import Graph from "@/components/notes/Graph";
import { Button } from "@/components/notes/ui/button";

import { IconChartDots3, IconLayoutSidebar } from "@tabler/icons-react";
import NotesList from "@/components/notes/NotesList";

export default function NotePage() {
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <>
      {/* Main content area */}

      <div className="flex flex-row  relative">
        {/* Botão de toggle */}
        <Button
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          variant="ghost"
          size="icon"
          className="absolute -top-11 left-4 z-50 text-white hover:bg-slate-700 hover:text-white"
        >
          <IconLayoutSidebar className="h-8 w-8" />
        </Button>
        {/* Container do Grafo com renderização condicional */}
        {isSidebarVisible && (
          <div className=" px-4 py-4 flex-shrink-0 border   bg-slate-900 ">
            <NotesList opensidebar={isSidebarVisible} />
          </div>
        )}

        <Editor />

        {/* Botão de toggle */}
        <Button
          onClick={() => setIsGraphVisible(!isGraphVisible)}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-4 z-10 text-white hover:bg-slate-700 hover:text-white"
        >
          {/* {isGraphVisible ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )} */}
          <IconChartDots3 className="h-5 w-5" />
        </Button>

        {/* Container do Grafo com renderização condicional */}
        {isGraphVisible && (
          <div className="flew flex-shrink-0 border border-neutral-200  bg-white dark:border-neutral-700">
            <Graph />
          </div>
        )}
      </div>
    </>
  );
}
