"use client";
import { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";

export default function Index() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);

  const loadDecks = () => {
    setDecks(getAllDecks());
  };

  useEffect(() => {
    loadDecks();
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
    loadDecks();
    setCreateDialogOpen(false);
    setDeckName("");
    setDeckDescription("");

    // Navigate to the new deck
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
      loadDecks();
    }
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleStudy = (deckId: string) => {
    router.push(`/flashcards/study/${deckId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient">
            Flashcards
          </h1>
          <p className="text-lg text-muted-foreground">
            Master anything with spaced repetition
          </p>
        </header>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">My Decks</h2>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>

        {decks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {decks.map((deck) => (
              <div
                key={deck.id}
                onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                className="cursor-pointer"
              >
                <DeckCard
                  deck={deck}
                  onStudy={handleStudy}
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
              className="bg-gradient-to-r from-primary to-primary-glow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Deck
            </Button>
          </div>
        )}
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
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
                placeholder="e.g., Spanish Vocabulary"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={deckDescription}
                onChange={(e) => setDeckDescription(e.target.value)}
                placeholder="Optional description..."
                className="mt-2"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDeck}>Create Deck</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deck?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              deck and all its cards.
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
