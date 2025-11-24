import { Deck } from "@/types/flashcard";
import { Card, CardContent } from "@/components/flashcards/ui/card";
import { Button } from "@/components/flashcards/ui/button";
import { BookOpen, Trash2 } from "lucide-react";
import { getCardsByDeck } from "@/lib/storage";
import { getDueCards } from "@/lib/spaced-repetition";

interface DeckCardProps {
  deck: Deck;
  onStudy: (deckId: string) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({ deck, onStudy, onDelete }: DeckCardProps) {
  const cards = getCardsByDeck(deck.id);
  const dueCards = getDueCards(cards);

  return (
    <Card className="glass hover:shadow-[var(--shadow-glow)] transition-all duration-300 group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">
              {deck.name}
            </h3>
            {deck.description && (
              <p className="text-sm text-muted-foreground">
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
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>

        <div className="flex gap-4 mb-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total: </span>
            <span className="text-foreground font-medium">{cards.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Due: </span>
            <span className="text-primary font-medium">{dueCards.length}</span>
          </div>
        </div>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onStudy(deck.id);
          }}
          className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-opacity"
          disabled={dueCards.length === 0}
        >
          <BookOpen className="mr-2 h-4 w-4" />
          {dueCards.length > 0
            ? `Study Now (${dueCards.length})`
            : "No cards due"}
        </Button>
      </CardContent>
    </Card>
  );
}
