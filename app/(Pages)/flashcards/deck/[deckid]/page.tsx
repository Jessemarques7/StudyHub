"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/flashcards/ui/button";
import { Card, CardContent } from "@/components/flashcards/ui/card";
import { Badge } from "@/components/flashcards/ui/badge";
import { Flashcard, Deck } from "@/types/flashcard";
import {
  getCardsByDeck,
  getAllDecks,
  deleteCard,
  saveCard,
} from "@/lib/storage";
import { CardEditorDialog } from "@/components/flashcards/CardEditorDialog";
import { ArrowLeft, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { SidebarDemo } from "@/components/app-sidebar-aceternity";
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

export default function DeckView({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  // Unwrap params no Next.js 15
  const { deckId } = use(params);
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  const loadData = () => {
    if (!deckId) return;
    const allDecks = getAllDecks();
    const currentDeck = allDecks.find((d) => d.id === deckId);
    setDeck(currentDeck || null);
    setCards(getCardsByDeck(deckId));
  };

  useEffect(() => {
    loadData();
  }, [deckId]);

  const handleSaveCard = (cardData: Partial<Flashcard>) => {
    const card: Flashcard = {
      id: editingCard?.id || crypto.randomUUID(),
      deckId: deckId,
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

    saveCard(card);
    toast.success(editingCard ? "Card updated" : "Card created");
    loadData();
    setEditingCard(undefined);
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setEditorOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete);
      toast.success("Card deleted");
      loadData();
    }
    setDeleteDialogOpen(false);
    setCardToDelete(null);
  };

  if (!deck)
    return (
      <SidebarDemo>
        <div className="p-8 text-white">Loading...</div>
      </SidebarDemo>
    );

  return (
    <SidebarDemo>
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 rounded-tl-2xl">
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        <div className="grid gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="bg-slate-900 border-slate-800 text-white hover:border-slate-700 transition-all"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <Badge
                    variant="outline"
                    className="capitalize text-white border-slate-600"
                  >
                    {card.type}
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
                      <Trash2 className="h-4 w-4 text-red-500" />
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <CardEditorDialog
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSave={handleSaveCard}
          card={editingCard}
          deckId={deckId}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-black dark:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarDemo>
  );
}
