// components/flashcards/DeckCard.tsx
"use client";

import { Deck } from "@/types/flashcard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2 } from "lucide-react";

interface DeckCardProps {
  deck: Deck;
  totalCards: number;
  dueCount: number;
  onStudy: (deckId: string) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({
  deck,
  totalCards,
  dueCount,
  onStudy,
  onDelete,
}: DeckCardProps) {
  return (
    <Card className="glass hover:shadow-[var(--shadow-glow)] transition-all duration-300 group h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1 line-clamp-1">
              {deck.name}
            </h3>
            {deck.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                {deck.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(deck.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity -mt-2 -mr-2"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="flex gap-4 mb-6 text-sm mt-auto">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="text-foreground font-medium">{totalCards}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Due: </span>
            <span className="text-primary font-medium">{dueCount}</span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onStudy(deck.id);
          }}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={dueCount === 0}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          {dueCount > 0 ? `Study Now (${dueCount})` : "No cards due"}
        </Button>
      </CardContent>
    </Card>
  );
}
