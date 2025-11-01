"use client";
import {
  ChevronRight,
  MoreHorizontal,
  SquarePen, // <-- 1. Importe o ícone
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"; // <-- Assumi que isso seja de "@/components/ui/collapsible"
import { useNotes } from "@/contexts/NotesContext";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function AppSidebar() {
  const { notes, setNotes } = useNotes();

  function handleCreateNewNote() {
    // Lógica para criar uma nova nota
    const newNote = {
      id: crypto.randomUUID(),
      title: "Untitled",
      content: [
        {
          type: "heading",
          content: "untitled",
        },
      ],
    };

    setNotes([...notes, newNote]);
  }

  function handleDeleteNote(noteId: string) {
    // Lógica para deletar uma nota
    console.log("passou delete", noteId, notes);
    setNotes(notes.filter((note) => note.id !== noteId));
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton asChild>
                      <div className="group">
                        <ChevronRight className=" h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />

                        <span>Notes</span>
                        <SquarePen
                          aria-label="Create New Note"
                          onClick={() => {
                            handleCreateNewNote();
                          }}
                          className="cursor-pointer ml-auto h-4 w-4"
                        />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {notes.map((note) => (
                        <Link key={note.id} href={`/notes/${note.id}`}>
                          <SidebarMenuSubItem>
                            {note.title}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction>
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem>
                                  <span>Rename Note</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    handleDeleteNote(note.id);
                                  }}
                                >
                                  <span>Delete Note</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </SidebarMenuSubItem>
                        </Link>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
