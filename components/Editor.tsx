// "use client";

// import { useNotes } from "@/contexts/NotesContext";
// import Blocknote from "./Blocknote";
// import { useParams } from "next/navigation";
// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import { Block } from "@blocknote/core";
// import EmojiPicker from "emoji-picker-react";
// import { CoverPicker } from "@/components/NotePickers";
// import { cn } from "@/lib/utils";
// import { Smile, Upload, X } from "lucide-react";
// import { Button } from "@/components/ui/button";

// export default function Editor() {
//   const params = useParams<{ noteid: string }>();
//   const { notes, updateNote, getNote } = useNotes();

//   const currentNote = useMemo(
//     () => getNote(params.noteid),
//     [params.noteid, getNote]
//   );

//   const [title, setTitle] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
//   const iconUploadRef = useRef<HTMLInputElement>(null);

//   // Sincroniza o título quando a nota muda
//   useEffect(() => {
//     if (currentNote) {
//       setTitle(currentNote.title);
//     }
//   }, [currentNote]);

//   // Atualiza o conteúdo da nota
//   const handleUpdateContent = useCallback(
//     (updatedContent: Block[]) => {
//       if (!params.noteid) return;
//       updateNote(params.noteid, { content: updatedContent });
//     },
//     [params.noteid, updateNote]
//   );

//   // Atualiza o título da nota
//   const handleTitleChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const newTitle = e.target.value;
//       setTitle(newTitle);
//     },
//     []
//   );

//   // Salva o título quando perde o foco
//   const handleTitleBlur = useCallback(() => {
//     if (!params.noteid || !title.trim()) return;
//     updateNote(params.noteid, { title: title.trim() });
//     setIsEditing(false);
//   }, [params.noteid, title, updateNote]);

//   // Salva o título ao pressionar Enter
//   const handleTitleKeyDown = useCallback(
//     (e: React.KeyboardEvent<HTMLInputElement>) => {
//       if (e.key === "Enter") {
//         e.currentTarget.blur();
//       } else if (e.key === "Escape") {
//         setTitle(currentNote?.title || "");
//         setIsEditing(false);
//         e.currentTarget.blur();
//       }
//     },
//     [currentNote]
//   );

//   // Handlers para Ícone
//   const handleIconRemove = useCallback(() => {
//     if (!params.noteid) return;
//     updateNote(params.noteid, { icon: null });
//   }, [params.noteid, updateNote]);

//   const handleIconUpload = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const file = e.target.files?.[0];
//       if (!file) return;
//       if (file.size > 1024 * 1024) {
//         // 1MB limit
//         alert("File is too large (max 1MB).");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         updateNote(params.noteid, { icon: reader.result as string });
//       };
//       reader.readAsDataURL(file);
//       e.target.value = ""; // Clear input
//     },
//     [params.noteid, updateNote]
//   );

//   // Handlers para Capa
//   const handleCoverSelect = useCallback(
//     (cover: string) => {
//       if (!params.noteid) return;
//       updateNote(params.noteid, { coverImage: cover });
//     },
//     [params.noteid, updateNote]
//   );

//   const handleCoverRemove = useCallback(() => {
//     if (!params.noteid) return;
//     updateNote(params.noteid, { coverImage: null });
//   }, [params.noteid, updateNote]);

//   if (!currentNote) {
//     return (
//       <div className="flex flex-1 items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-bold text-gray-400 mb-2">
//             No note selected
//           </h2>
//           <p className="text-gray-500">
//             Select a note from the sidebar or create a new one
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-1">
//       {/* Wrapper principal:
//         - 'relative' para posicionar o ícone
//         - 'overflow-hidden' REMOVIDO para evitar corte
//       */}
//       <div className="flex h-full w-full relative flex-col rounded-tl-2xl ">
//         {/* Header com capa dinâmica */}
//         <div className="h-[25vh] group relative">
//           {currentNote.coverImage ? (
//             (() => {
//               const cover = currentNote.coverImage;
//               if (cover.startsWith("http") || cover.startsWith("data:")) {
//                 return (
//                   <img
//                     src={cover}
//                     alt="Cover"
//                     className="w-full h-full object-cover"
//                   />
//                 );
//               } else if (cover.startsWith("bg-") || cover.startsWith("from-")) {
//                 return <div className={cn("w-full h-full", cover)} />;
//               } else {
//                 return (
//                   <div
//                     className="w-full h-full"
//                     style={{ background: cover }}
//                   />
//                 );
//               }
//             })()
//           ) : (
//             <div className="w-full h-full bg-slate-800" /> // Capa padrão
//           )}
//           <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
//             <CoverPicker
//               currentCover={currentNote.coverImage}
//               onSelect={handleCoverSelect}
//               onRemove={handleCoverRemove}
//             />
//           </div>
//         </div>

//         {/* Seletor de Ícone:
//           - Movido para fora do container de scroll
//           - Posicionado 'absolute' em relação ao wrapper principal
//           - 'top' é calculado para ficar metade sobre a capa
//           - 'z-50' para ficar acima do conteúdo
//         */}
//         <div
//           className="text-white cursor-pointer z-50 absolute ml-12 group"
//           style={{ top: "calc(25vh - 40px)" }} // 48px é metade da altura do ícone (aprox 6rem/2)
//         >
//           <div className="relative flex items-end gap-2">
//             <button
//               onClick={() => setEmojiPickerVisible((prev) => !prev)}
//               className="text-6xl cursor-pointer rounded-lg p-1 transition-colors"
//               aria-label="Pick emoji icon"
//             >
//               {currentNote.icon && !currentNote.icon.startsWith("data:") ? (
//                 <span>{currentNote.icon}</span>
//               ) : currentNote.icon && currentNote.icon.startsWith("data:") ? (
//                 // eslint-disable-next-line @next/next/no-img-element
//                 <img
//                   src={currentNote.icon}
//                   alt="icon"
//                   className="w-16 h-16 object-cover rounded"
//                 />
//               ) : (
//                 <Smile className="w-16 h-16 text-slate-600 p-2" />
//               )}
//             </button>
//             <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               <Button
//                 size="icon-sm"
//                 variant="outline"
//                 className="bg-black/50 hover:bg-black/70 border-slate-700"
//                 onClick={() => iconUploadRef.current?.click()}
//                 aria-label="Upload icon"
//               >
//                 <Upload className="w-4 h-4" />
//               </Button>
//               {currentNote.icon && (
//                 <Button
//                   size="icon-sm"
//                   variant="outline"
//                   className="bg-black/50 hover:bg-black/70 border-slate-700 text-red-400 hover:text-red-400"
//                   onClick={handleIconRemove}
//                   aria-label="Remove icon"
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               )}
//             </div>
//             <input
//               type="file"
//               ref={iconUploadRef}
//               accept="image/*,.svg"
//               onChange={handleIconUpload}
//               className="hidden"
//             />
//             {emojiPickerVisible && (
//               <div className="absolute top-full mt-2 z-50">
//                 <EmojiPicker
//                   theme="dark"
//                   onEmojiClick={(emojiData) => {
//                     updateNote(params.noteid, { icon: emojiData.emoji });
//                     setEmojiPickerVisible(false);
//                   }}
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Conteúdo do editor (com scroll) */}
//         <div className="flex-1 overflow-auto p-2 md:px-10 md:py-6 flex items-start justify-center  dark:bg-slate-950">
//           <div className="w-full max-w-[770px]">
//             {/* Input do título:
//               - Adicionado 'mt-12' (margin-top) para dar espaço ao ícone
//             */}
//             <input
//               type="text"
//               value={title}
//               onChange={handleTitleChange}
//               onBlur={handleTitleBlur}
//               onKeyDown={handleTitleKeyDown}
//               onFocus={() => setIsEditing(true)}
//               placeholder="Untitled"
//               aria-label="Note title"
//               className="w-full px-[54px] mt-12 mb-4 text-gray-50 text-5xl font-bold bg-transparent border-none outline-none placeholder:text-gray-400 focus:placeholder:text-gray-500 transition-colors"
//             />

//             {/* Editor de conteúdo */}
//             <Blocknote
//               onUpdateNote={handleUpdateContent}
//               currentNote={currentNote}
//               notes={notes}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNotes } from "@/contexts/NotesContext";
import { Block } from "@blocknote/core";
import Blocknote from "./Blocknote";
import { NoteHeader } from "./NoteHeader";
import { NoteTitleInput } from "./NoteTitleInput";

export default function Editor() {
  const params = useParams<{ noteid: string }>();
  const { notes, updateNote, getNote } = useNotes();

  const currentNote = useMemo(
    () => getNote(params.noteid),
    [params.noteid, getNote]
  );

  const [title, setTitle] = useState("");

  // Sincroniza o título quando a nota muda
  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
    }
  }, [currentNote?.id]);

  const handleUpdateContent = useCallback(
    (updatedContent: Block[]) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { content: updatedContent });
    },
    [params.noteid, updateNote]
  );

  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleTitleSave = useCallback(() => {
    if (!params.noteid || !title.trim()) return;
    updateNote(params.noteid, { title: title.trim() });
  }, [params.noteid, title, updateNote]);

  const handleIconUpdate = useCallback(
    (icon: string | null) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { icon });
    },
    [params.noteid, updateNote]
  );

  const handleCoverUpdate = useCallback(
    (coverImage: string | null) => {
      if (!params.noteid) return;
      updateNote(params.noteid, { coverImage });
    },
    [params.noteid, updateNote]
  );

  if (!currentNote) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-2">
            No note selected
          </h2>
          <p className="text-gray-500">
            Select a note from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <NoteHeader
        note={currentNote}
        onIconUpdate={handleIconUpdate}
        onCoverUpdate={handleCoverUpdate}
      />

      <div className="flex-1 overflow-auto p-2 md:px-10 md:py-6 flex items-start justify-center dark:bg-slate-950">
        <div className="w-full max-w-[770px]">
          <NoteTitleInput
            value={title}
            onChange={handleTitleChange}
            onSave={handleTitleSave}
          />

          <Blocknote
            onUpdateNote={handleUpdateContent}
            currentNote={currentNote}
            notes={notes}
          />
        </div>
      </div>
    </div>
  );
}
