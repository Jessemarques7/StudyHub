"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/flashcards/ui/button";
import { Input } from "@/components/flashcards/ui/input";
import { Label } from "@/components/flashcards/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/flashcards/ui/dialog";
import { DeckCard } from "@/components/flashcards/DeckCard";
import { Deck } from "@/types/flashcard";
import { getAllDecks, saveDeck, deleteDeck } from "@/lib/storage";
import { Plus, BookOpen } from "lucide-react";
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
import { SidebarDemo } from "@/components/app-sidebar-aceternity";

export default function FlashcardsIndex() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  // Carregar decks apenas no cliente
  useEffect(() => {
    setDecks(getAllDecks());
  }, []);

  const handleCreateDeck = () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: deckName.trim(),
      description: deckDescription.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    saveDeck(newDeck);
    toast.success("Deck created!");
    setDecks(getAllDecks());
    setCreateDialogOpen(false);
    setDeckName("");
    setDeckDescription("");

    router.push(`/flashcards/deck/${newDeck.id}`);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDeckToDelete(deckId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deckToDelete) {
      deleteDeck(deckToDelete);
      toast.success("Deck deleted");
      setDecks(getAllDecks());
    }
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  return (
    <SidebarDemo>
      <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8 rounded-tl-2xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
            FlashMind
          </h1>
          <p className="text-lg text-muted-foreground">
            Master anything with spaced repetition
          </p>
        </header>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">My Decks</h2>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                className="cursor-pointer"
              >
                <DeckCard
                  deck={deck}
                  onStudy={(id) => router.push(`/flashcards/study/${id}`)}
                  onDelete={handleDeleteDeck}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <BookOpen className="h-20 w-20 mx-auto mb-6 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No decks yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first deck to start learning!
            </p>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Deck
            </Button>
          </div>
        )}

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Create New Deck</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Deck Name *</Label>
                <Input
                  id="name"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="mt-2 bg-slate-950 border-slate-800"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="mt-2 bg-slate-950 border-slate-800"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="text-black dark:text-white"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateDeck}>Create Deck</Button>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Deck?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                deck and all its cards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-black dark:text-white">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarDemo>
  );
}
