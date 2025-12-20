// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Button } from "@/components/flashcards/ui/button";
// import { Card, CardContent } from "@/components/flashcards/ui/card";
// import { Badge } from "@/components/flashcards/ui/badge";
// import { Flashcard, Deck } from "@/types/flashcard";
// import { getCardsByDeck, getAllDecks, deleteCard } from "@/lib/storage";
// import { CardEditorDialog } from "@/components/flashcards/CardEditorDialog";
// import { saveCard } from "@/lib/storage";
// import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
// import { toast } from "sonner";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/flashcards/ui/alert-dialog";

// export default function DeckView() {
//   const params = useParams<{ deckid: string }>();
//   const deckId = params.deckid;
//   const router = useRouter();
//   const [deck, setDeck] = useState<Deck | null>(null);
//   const [cards, setCards] = useState<Flashcard[]>([]);
//   const [editorOpen, setEditorOpen] = useState(false);
//   const [editingCard, setEditingCard] = useState<Flashcard | undefined>();
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [cardToDelete, setCardToDelete] = useState<string | null>(null);

//   const loadData = () => {
//     if (!deckId) return;
//     const allDecks = getAllDecks();
//     const currentDeck = allDecks.find((d) => d.id === deckId);
//     setDeck(currentDeck || null);
//     setCards(getCardsByDeck(deckId));
//   };

//   useEffect(() => {
//     loadData();
//   }, [deckId]);

//   const handleSaveCard = (cardData: Partial<Flashcard>) => {
//     const card: Flashcard = {
//       id: editingCard?.id || crypto.randomUUID(),
//       deckId: deckId!,
//       type: cardData.type || "regular",
//       front: cardData.front!,
//       back: cardData.back!,
//       imageUrl: cardData.imageUrl,
//       audioUrl: cardData.audioUrl,
//       backImageUrl: cardData.backImageUrl,
//       backAudioUrl: cardData.backAudioUrl,
//       multipleChoiceOptions: cardData.multipleChoiceOptions,
//       tags: cardData.tags || [],
//       easeFactor: cardData.easeFactor || 2.5,
//       interval: cardData.interval || 0,
//       repetitions: cardData.repetitions || 0,
//       nextReview: cardData.nextReview || new Date(),
//       createdAt: cardData.createdAt || new Date(),
//       updatedAt: new Date(),
//     };

//     saveCard(card);
//     toast.success(editingCard ? "Card updated" : "Card created");
//     loadData();
//     setEditingCard(undefined);
//   };

//   const handleEditCard = (card: Flashcard) => {
//     setEditingCard(card);
//     setEditorOpen(true);
//   };

//   const handleDeleteCard = (cardId: string) => {
//     setCardToDelete(cardId);
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = () => {
//     if (cardToDelete) {
//       deleteCard(cardToDelete);
//       toast.success("Card deleted");
//       loadData();
//     }
//     setDeleteDialogOpen(false);
//     setCardToDelete(null);
//   };

//   if (!deck) {
//     return <div>Deck not found</div>;
//   }

//   return (
//     <div className="min-h-screen bg-background p-4">
//       <div className="max-w-6xl mx-auto">
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center gap-4">
//             <Button variant="ghost" onClick={() => router.push("/flashcards")}>
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back
//             </Button>
//             <div>
//               <h1 className="text-3xl font-bold text-gradient">{deck.name}</h1>
//               {deck.description && (
//                 <p className="text-muted-foreground">{deck.description}</p>
//               )}
//             </div>
//           </div>
//           <Button
//             onClick={() => {
//               setEditingCard(undefined);
//               setEditorOpen(true);
//             }}
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             Add Card
//           </Button>
//         </div>

//         <div className="grid gap-4">
//           {cards.map((card) => (
//             <Card
//               key={card.id}
//               className="glass hover:shadow-[var(--shadow-glow)] transition-all"
//             >
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-start gap-4 mb-3">
//                   <Badge variant="outline" className="capitalize">
//                     {card.type === "one-sided"
//                       ? "One-Sided"
//                       : card.type === "multiple-choice"
//                       ? "Multiple Choice"
//                       : "Regular"}
//                   </Badge>
//                   <div className="flex gap-2">
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleEditCard(card)}
//                     >
//                       <Edit className="h-4 w-4" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => handleDeleteCard(card.id)}
//                     >
//                       <Trash2 className="h-4 w-4 text-destructive" />
//                     </Button>
//                   </div>
//                 </div>

//                 <div className="flex-1 grid md:grid-cols-2 gap-6">
//                   <div>
//                     <h4 className="text-sm text-muted-foreground mb-2">
//                       Front
//                     </h4>
//                     <div
//                       className="prose prose-invert prose-sm max-w-none"
//                       dangerouslySetInnerHTML={{ __html: card.front }}
//                     />
//                   </div>

//                   {card.type === "regular" && (
//                     <div>
//                       <h4 className="text-sm text-muted-foreground mb-2">
//                         Back
//                       </h4>
//                       <div
//                         className="prose prose-invert prose-sm max-w-none"
//                         dangerouslySetInnerHTML={{ __html: card.back }}
//                       />
//                     </div>
//                   )}

//                   {card.type === "multiple-choice" &&
//                     card.multipleChoiceOptions && (
//                       <div>
//                         <h4 className="text-sm text-muted-foreground mb-2">
//                           Options
//                         </h4>
//                         <div className="space-y-2">
//                           {card.multipleChoiceOptions.map((option) => (
//                             <div
//                               key={option.id}
//                               className="flex items-center gap-2 text-sm"
//                             >
//                               <span
//                                 className={
//                                   option.isCorrect
//                                     ? "text-success"
//                                     : "text-muted-foreground"
//                                 }
//                               >
//                                 {option.isCorrect ? "✓" : "○"}
//                               </span>
//                               <span>{option.text}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                 </div>

//                 {card.tags.length > 0 && (
//                   <div className="mt-4 flex gap-2">
//                     {card.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
//                       >
//                         {tag}
//                       </span>
//                     ))}
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
//           ))}

//           {cards.length === 0 && (
//             <Card className="glass">
//               <CardContent className="p-12 text-center">
//                 <p className="text-muted-foreground">
//                   No cards yet. Click "Add Card" to create your first one!
//                 </p>
//               </CardContent>
//             </Card>
//           )}
//         </div>
//       </div>

//       <CardEditorDialog
//         open={editorOpen}
//         onOpenChange={setEditorOpen}
//         onSave={handleSaveCard}
//         card={editingCard}
//         deckId={deckId!}
//       />

//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Card?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the
//               card.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction onClick={confirmDelete}>
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/flashcards/ui/button";
import { Card, CardContent } from "@/components/flashcards/ui/card";
import { Badge } from "@/components/flashcards/ui/badge";
import { Flashcard, Deck } from "@/types/flashcard";
import { getCardsByDeck, getAllDecks, deleteCard } from "@/lib/storage";
import { CardEditorDialog } from "@/components/flashcards/CardEditorDialog";
import { saveCard } from "@/lib/storage";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/flashcards/ui/alert-dialog";

export default function DeckView() {
  const params = useParams<{ deckid: string }>();
  const deckId = params.deckid;
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    if (!deckId) return;
    setIsLoading(true);
    try {
      // Fetch deck info and cards in parallel
      const [allDecks, deckCards] = await Promise.all([
        getAllDecks(),
        getCardsByDeck(deckId),
      ]);

      const currentDeck = allDecks.find((d) => d.id === deckId);
      setDeck(currentDeck || null);
      setCards(deckCards);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load deck data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [deckId]);

  const handleSaveCard = async (cardData: Partial<Flashcard>) => {
    try {
      const card: Flashcard = {
        id: editingCard?.id || crypto.randomUUID(),
        deckId: deckId!,
        type: cardData.type || "regular",
        front: cardData.front!,
        back: cardData.back!,
        imageUrl: cardData.imageUrl,
        audioUrl: cardData.audioUrl,
        backImageUrl: cardData.backImageUrl,
        backAudioUrl: cardData.backAudioUrl,
        multipleChoiceOptions: cardData.multipleChoiceOptions,
        tags: cardData.tags || [],
        easeFactor: cardData.easeFactor || 2.5,
        interval: cardData.interval || 0,
        repetitions: cardData.repetitions || 0,
        nextReview: cardData.nextReview || new Date(),
        createdAt: cardData.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await saveCard(card);
      toast.success(editingCard ? "Card updated" : "Card created");
      await loadData(); // Reload to get updates
      setEditingCard(undefined);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save card");
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setEditorOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (cardToDelete) {
      try {
        await deleteCard(cardToDelete);
        toast.success("Card deleted");
        await loadData();
      } catch (error) {
        toast.error("Failed to delete card");
      }
    }
    setDeleteDialogOpen(false);
    setCardToDelete(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading deck...</div>;
  }

  if (!deck) {
    return <div>Deck not found</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/flashcards")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gradient">{deck.name}</h1>
              {deck.description && (
                <p className="text-muted-foreground">{deck.description}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              setEditingCard(undefined);
              setEditorOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        <div className="grid gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="glass hover:shadow-[var(--shadow-glow)] transition-all"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <Badge variant="outline" className="capitalize">
                    {card.type === "one-sided"
                      ? "One-Sided"
                      : card.type === "multiple-choice"
                      ? "Multiple Choice"
                      : "Regular"}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCard(card)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm text-muted-foreground mb-2">
                      Front
                    </h4>
                    <div
                      className="prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: card.front }}
                    />
                  </div>

                  {card.type === "regular" && (
                    <div>
                      <h4 className="text-sm text-muted-foreground mb-2">
                        Back
                      </h4>
                      <div
                        className="prose prose-invert prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: card.back }}
                      />
                    </div>
                  )}

                  {card.type === "multiple-choice" &&
                    card.multipleChoiceOptions && (
                      <div>
                        <h4 className="text-sm text-muted-foreground mb-2">
                          Options
                        </h4>
                        <div className="space-y-2">
                          {card.multipleChoiceOptions.map((option) => (
                            <div
                              key={option.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className={
                                  option.isCorrect
                                    ? "text-success"
                                    : "text-muted-foreground"
                                }
                              >
                                {option.isCorrect ? "✓" : "○"}
                              </span>
                              <span>{option.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {card.tags.length > 0 && (
                  <div className="mt-4 flex gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {cards.length === 0 && (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No cards yet. Click "Add Card" to create your first one!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CardEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSaveCard}
        card={editingCard}
        deckId={deckId!}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              card.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
