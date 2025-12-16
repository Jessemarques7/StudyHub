"use client";

import { useState } from "react";

import Editor from "@/components/notes/Editor";
import Graph from "@/components/notes/Graph";
import { Button } from "@/components/notes/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";

export default function NotePage() {
  const [isGraphVisible, setIsGraphVisible] = useState(true);

  return (
    <>
      {/* Main content area */}
      <div className="h-6 bg-slate-950 rounded-tl-2xl "></div>
      <div className="flex flex-row overflow-hidden relative">
        <Editor />

        {/* Botão de toggle */}
        <Button
          onClick={() => setIsGraphVisible(!isGraphVisible)}
          variant="ghost"
          size="icon"
          className="absolute top-2 right-4 z-10 text-white hover:bg-slate-700 hover:text-white"
        >
          {isGraphVisible ? (
            <PanelRightClose className="h-5 w-5" />
          ) : (
            <PanelRightOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Container do Grafo com renderização condicional */}
        {isGraphVisible && (
          <div className="w-[420px] flex-shrink-0 ">
            <Graph />
          </div>
        )}
      </div>
    </>
  );
}
