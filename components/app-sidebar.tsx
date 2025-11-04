"use client";
import { useRouter, usePathname } from "next/navigation"; // ⬅️ IMPORTANTE
import { ChevronRight, MoreHorizontal, SquarePen } from "lucide-react";
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
} from "@radix-ui/react-collapsible";
import { useNotes } from "@/contexts/NotesContext";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";

export function AppSidebar() {
  const router = useRouter(); // ⬅️ para redirecionar
  const pathname = usePathname(); // ⬅️ para saber qual nota está aberta
  const { notes, setNotes } = useNotes();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  function handleCreateNewNote() {
    const newNote = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: [
        {
          // type: "heading",
          // content: "",
        },
      ],
    };

    setNotes([...notes, newNote]);

    router.push(`/notes/${newNote.id}`); // ⬅️ redireciona para a nova nota
  }

  function handleDeleteNote(noteId: string) {
    const updatedNotes = notes.filter((note) => note.id !== noteId);
    setNotes(updatedNotes);

    // Verifica se a nota deletada é a que está aberta
    const currentNoteId = pathname.split("/").pop();

    if (noteId === currentNoteId) {
      if (updatedNotes.length > 0) {
        // Redireciona para a primeira nota restante
        router.push(`/notes/${updatedNotes[0].id}`);
      } else {
        // Se não restar nenhuma nota, redireciona para home
        router.push("/");
      }
    }
  }

  function handleStartEditing(noteId: string, currentTitle: string) {
    setEditingNoteId(noteId);
    setTempTitle(currentTitle);
  }

  function handleSaveRename(noteId: string) {
    if (tempTitle.trim() === "") return;
    setNotes(
      notes.map((note) =>
        note.id === noteId ? { ...note, title: tempTitle } : note
      )
    );
    setEditingNoteId(null);
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
                      <div className="group flex items-center">
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        <span className="ml-1">Notes</span>
                        <SquarePen
                          aria-label="Create New Note"
                          onClick={handleCreateNewNote}
                          className="cursor-pointer ml-auto h-4 w-4"
                        />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {notes.map((note) => (
                        <SidebarMenuSubItem
                          key={note.id}
                          className="flex items-center"
                        >
                          {editingNoteId === note.id ? (
                            <input
                              value={tempTitle}
                              onChange={(e) => setTempTitle(e.target.value)}
                              onBlur={() => handleSaveRename(note.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleSaveRename(note.id);
                                if (e.key === "Escape") setEditingNoteId(null);
                              }}
                              autoFocus
                              className="flex-1 bg-transparent border-b border-muted focus:outline-none text-sm"
                            />
                          ) : (
                            <Link
                              href={`/notes/${note.id}`}
                              className="flex-1 truncate"
                            >
                              {note.title}
                            </Link>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction>
                                <MoreHorizontal />
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleStartEditing(note.id, note.title)
                                }
                              >
                                <span>Rename Note</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteNote(note.id)}
                              >
                                <span>Delete Note</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </SidebarMenuSubItem>
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
