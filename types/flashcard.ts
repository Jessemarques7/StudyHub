export type FlashcardType = 'regular' | 'one-sided' | 'multiple-choice';

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Flashcard {
  id: string;
  deckId: string;
  type: FlashcardType;
  front: string;
  back: string;
  imageUrl?: string;
  audioUrl?: string;
  backImageUrl?: string;
  backAudioUrl?: string;
  multipleChoiceOptions?: MultipleChoiceOption[];
  tags: string[];
  easeFactor: number; // SM-2 algorithm
  interval: number; // days
  repetitions: number;
  nextReview: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudyStats {
  deckId: string;
  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  dailyAverage: number;
  longestStreak: number;
  currentStreak: number;
  lastStudied?: Date;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect, but recognized
// 2: Incorrect, but easy to recall
// 3: Correct, but difficult
// 4: Correct, with hesitation
// 5: Perfect recall
