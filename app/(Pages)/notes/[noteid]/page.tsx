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
        className="flex flex-row pt-8 md:pt-12 h-screen relative"
      >
        <ResizablePanel>
          <Editor />
        </ResizablePanel>

        {/* Container do Grafo com renderização condicional */}
        {isGraphVisible && (
          <ResizablePanel
            defaultSize="30%"
            // 1. Adicionamos "relative" e "overflow-hidden" no className do painel
            className="relative flex overflow-hidden border border-border"
          >
            {/* 2. Componentes de fundo */}
            <StarsBackground className="absolute inset-0 z-0" />
            <ShootingStars
              className="absolute inset-0 z-0"
              minDelay={2000}
              maxDelay={5000}
            />

            {/* 3. O Gráfico é envolvido para ficar acima das estrelas (z-10) */}
            <div className="relative z-10 w-full h-full">
              <Graph classname="h-full w-full" />
            </div>
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
          className="absolute right-4 top-24 z-50 bg-secondary text-font hover:bg-complement/20 hover:text-font"
        >
          <IconLayoutSidebarRight className="h-8 w-8" />
        </Button>
        {/* Container do Grafo com renderização condicional */}
        {isSidebarVisible && (
          <ResizablePanel
            defaultSize="20%"
            className="flex-shrink-0 border border-border bg-secondary px-4 py-4"
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
          className="absolute right-4 top-14 z-10 bg-secondary text-font hover:bg-complement/20 hover:text-font"
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
