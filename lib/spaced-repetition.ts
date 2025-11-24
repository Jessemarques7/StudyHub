import { Flashcard, ReviewQuality } from "@/types/flashcard";

// SM-2 Algorithm (Anki-like)
export function calculateNextReview(
  card: Flashcard,
  quality: ReviewQuality
): Pick<Flashcard, "easeFactor" | "interval" | "repetitions" | "nextReview"> {
  let { easeFactor, interval, repetitions } = card;

  if (quality < 3) {
    // Failed card - reset
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview,
  };
}

export function isCardDueForReview(card: Flashcard): boolean {
  const cardDate = new Date(card.nextReview);
  const now = new Date();
  const isDue = cardDate <= now;
  console.log('Card due check:', {
    cardNextReview: cardDate,
    now: now,
    isDue: isDue,
    difference: now.getTime() - cardDate.getTime()
  });
  return isDue;
}

export function getDueCards(cards: Flashcard[]): Flashcard[] {
  return cards.filter(isCardDueForReview).sort((a, b) => 
    new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()
  );
}
