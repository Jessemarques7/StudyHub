"use client";

import { useState } from "react";

import Editor from "@/components/notes/Editor";
import Graph from "@/components/notes/Graph";
import { Button } from "@/components/ui/button";

import {
  IconChartDots3,
  IconLayoutSidebar,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRight,
} from "@tabler/icons-react";
import NotesList from "@/components/notes/NotesList";
import { StarsBackground } from "@/components/ui/stars-background";
import { ShootingStars } from "@/components/ui/shooting-stars";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function NotePage() {
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  return (
    <>
      {/* Main content area */}

      <ResizablePanelGroup
        orientation="horizontal"
        className="flex flex-row pt-12 h-screen relative"
      >
        <ResizablePanel>
          <Editor />
        </ResizablePanel>

        {/* Container do Grafo com renderização condicional */}
        {isGraphVisible && (
          <ResizablePanel
            defaultSize="30%"
            className="flex border border-neutral-200   dark:border-neutral-700"
          >
            <Graph classname="h-full  w-full" />

            <ShootingStars className="-z-10" minDelay={2000} maxDelay={5000} />
            <StarsBackground className="-z-10" />
          </ResizablePanel>
        )}

        {/* Botão de toggle */}

        <Button
          onClick={() => {
            setIsSidebarVisible(!isSidebarVisible);
            setIsGraphVisible(false);
          }}
          variant="ghost"
          size="icon"
          className="absolute top-24 right-4 z-50 text-white bg-slate-900 hover:bg-slate-700 hover:text-white"
        >
          <IconLayoutSidebarRight className="h-8 w-8" />
        </Button>
        {/* Container do Grafo com renderização condicional */}
        {isSidebarVisible && (
          <ResizablePanel
            defaultSize="20%"
            className=" px-4 py-4 flex-shrink-0 border   bg-slate-900 "
          >
            <NotesList opensidebar={isSidebarVisible} />
          </ResizablePanel>
        )}

        {/* Botão de toggle */}
        <Button
          onClick={() => {
            setIsGraphVisible(!isGraphVisible);
            setIsSidebarVisible(false);
          }}
          variant="ghost"
          size="icon"
          className="absolute top-14 right-4 z-10 text-white bg-slate-900 hover:bg-slate-700 hover:text-white"
        >
          {/* {isGraphVisible ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )} */}
          <IconChartDots3 className="h-5 w-5" />
        </Button>
      </ResizablePanelGroup>
    </>
  );
}
