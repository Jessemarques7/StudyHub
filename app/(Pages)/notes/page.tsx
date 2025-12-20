"use client";

import { useMemo, useState } from "react";

import Editor from "@/components/notes/Editor";
import Graph from "@/components/notes/Graph";
import { Button } from "@/components/notes/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useParams } from "next/navigation";
import { useNotes } from "@/contexts/NotesContext";
import { IconChartDots3, IconChartDots3Filled } from "@tabler/icons-react";

export default function NotePage() {
  const [isGraphVisible, setIsGraphVisible] = useState(false);
  const params = useParams<{ noteid: string }>();
  const { getNote } = useNotes();

  const currentNote = useMemo(
    () => getNote(params.noteid),
    [params.noteid, getNote]
  );

  return (
    <>
      {/* Main content area */}
      <div className=" py-2 px-8 bg-slate-950 rounded-tl-2xl ">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/notes">Notes</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentNote?.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex flex-row overflow-hidden relative">
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
          <div className="w-[420px] flex-shrink-0 border border-neutral-200  bg-white dark:border-neutral-700">
            <Graph />
          </div>
        )}
      </div>
    </>
  );
}
