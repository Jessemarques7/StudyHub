"use client";

import "../../stars.css";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Deck } from "@/types/flashcard";
import {
  deleteDeck,
  getAllDecks,
  getCardCountsByDeck,
  saveDeck,
} from "@/lib/storage";
import {
  getCurrentStreak,
  getLongestStreak,
  getReviewActivity,
  getTodayActivityDate,
  ReviewActivityDay,
} from "@/lib/review-activity";
import { ReviewHeatmap } from "@/components/flashcards/ReviewHeatmap";
import { BookOpen, Plus, Shield, Trash2 } from "lucide-react";
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
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

type DeckCounts = {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
};

const emptyDeckCounts: DeckCounts = {
  total: 0,
  new: 0,
  learning: 0,
  review: 0,
  due: 0,
};

export default function Index() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cardCounts, setCardCounts] = useState<Record<string, DeckCounts>>({});
  const [reviewActivity, setReviewActivity] = useState<ReviewActivityDay[]>([]);
  const [isClientReady, setIsClientReady] = useState(false);

  const loadDecks = async () => {
    try {
      const data = await getAllDecks();
      setDecks(data);
      setCardCounts(await getCardCountsByDeck(data.map((deck) => deck.id)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load decks");
    }
  };

  useEffect(() => {
    loadDecks();
    setReviewActivity(getReviewActivity());
    setIsClientReady(true);
  }, []);

  const todayStudied =
    reviewActivity.find((day) => day.date === getTodayActivityDate())?.count ??
    0;
  const totalStudied = reviewActivity.reduce((sum, day) => sum + day.count, 0);
  const activeDays = reviewActivity.filter((day) => day.count > 0).length;
  const dailyAverage =
    activeDays > 0 ? Math.round(totalStudied / activeDays) : 0;
  const currentStreak = getCurrentStreak(reviewActivity);
  const longestStreak = getLongestStreak(reviewActivity);
  const heatmapStartDate = new Date();
  heatmapStartDate.setMonth(heatmapStartDate.getMonth() - 8);

  const handleCreateDeck = async () => {
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    setIsLoading(true);
    try {
      const newDeck: Deck = {
        id: crypto.randomUUID(),
        name: deckName.trim(),
        description: deckDescription.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await saveDeck(newDeck);
      toast.success("Deck created!");
      await loadDecks();
      setCreateDialogOpen(false);
      setDeckName("");
      setDeckDescription("");

      // Navigate to the new deck
      router.push(`/flashcards/deck/${newDeck.id}`);
    } catch {
      toast.error("Failed to create deck");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDeck = (deckId: string) => {
    setDeckToDelete(deckId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deckToDelete) {
      try {
        await deleteDeck(deckToDelete);
        toast.success("Deck deleted");
        await loadDecks();
      } catch {
        toast.error("Failed to delete deck");
      }
    }
    setDeleteDialogOpen(false);
    setDeckToDelete(null);
  };

  const handleStudy = (deckId: string) => {
    router.push(`/flashcards/study/${deckId}`);
  };

  return (
    <div className="relative mt-16 min-h-[calc(100vh-4rem)] bg-background">
      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Flashcards</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Decks
            </h1>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="shrink-0 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        </div>

        {decks.length > 0 ? (
          <div className="mx-auto w-full max-w-4xl animate-fade-in overflow-hidden rounded-lg border border-border bg-card/55 shadow-card backdrop-blur-xl">
            <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_72px_80px] items-center border-b border-border px-4 py-3 text-sm font-semibold text-muted-foreground md:grid-cols-[minmax(0,1fr)_96px_96px_96px_88px] md:px-6">
              <span>Deck</span>
              <span className="text-center">New</span>
              <span className="text-center">Learn</span>
              <span className="text-center">Due</span>
              <span className="sr-only">Actions</span>
            </div>
            <div className="divide-y divide-border/70">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  onClick={() => router.push(`/flashcards/deck/${deck.id}`)}
                  className="grid cursor-pointer grid-cols-[minmax(0,1fr)_72px_72px_72px_80px] items-center px-4 py-3 transition-colors hover:bg-primary/10 md:grid-cols-[minmax(0,1fr)_96px_96px_96px_88px] md:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base font-medium">
                        {deck.name}
                      </span>
                      {(cardCounts[deck.id] ?? emptyDeckCounts).review > 0 && (
                        <Shield className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </div>
                    {deck.description && (
                      <p className="truncate text-sm text-muted-foreground">
                        {deck.description}
                      </p>
                    )}
                  </div>
                  <span className="text-center text-muted-foreground">
                    {(cardCounts[deck.id] ?? emptyDeckCounts).new}
                  </span>
                  <span className="text-center text-warning">
                    {(cardCounts[deck.id] ?? emptyDeckCounts).learning}
                  </span>
                  <span className="text-center font-medium text-success">
                    {(cardCounts[deck.id] ?? emptyDeckCounts).due}
                  </span>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={(cardCounts[deck.id] ?? emptyDeckCounts).due === 0}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleStudy(deck.id);
                      }}
                      aria-label={`Study ${deck.name}`}
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      aria-label={`Delete ${deck.name}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-4xl rounded-lg border border-border bg-card/55 py-20 text-center backdrop-blur-xl">
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

        <section className="mx-auto w-full max-w-4xl">
          <div className="mb-4 text-center">
            <p className="text-lg font-medium">
              Studied {todayStudied} cards today
            </p>
            <p className="text-sm text-muted-foreground">
              {totalStudied} total reviews tracked on this device
            </p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card/45 px-4 py-5 backdrop-blur-xl">
            {isClientReady ? (
              <ReviewHeatmap
                value={reviewActivity}
                startDate={heatmapStartDate}
                endDate={new Date()}
              />
            ) : (
              <div className="h-[125px] min-w-[760px]" />
            )}
          </div>
          <div className="mt-4 grid gap-3 text-center text-sm font-medium md:grid-cols-3">
            <p>
              Daily average:{" "}
              <span className="text-primary">{dailyAverage} cards</span>
            </p>
            <p>
              Longest streak:{" "}
              <span className="text-primary">{longestStreak} days</span>
            </p>
            <p>
              Current streak:{" "}
              <span className="text-primary">{currentStreak} days</span>
            </p>
          </div>
        </section>
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
            <Button onClick={handleCreateDeck} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Deck"}
            </Button>
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
