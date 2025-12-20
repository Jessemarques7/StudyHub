// "use client";
// import { useState, useEffect } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Button } from "@/components/flashcards/ui/button";
// import { Card, CardContent } from "@/components/flashcards/ui/card";
// import { Flashcard, ReviewQuality } from "@/types/flashcard";
// import { getCardsByDeck } from "@/lib/storage";
// import { getDueCards, calculateNextReview } from "@/lib/spaced-repetition";
// import { saveCard } from "@/lib/storage";
// import { ArrowLeft, Volume2 } from "lucide-react";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { navigate } from "next/dist/client/components/segment-cache";

// export default function Study() {
//   const params = useParams<{ deckid: string }>();
//   const deckId = params.deckid;
//   const router = useRouter();
//   const [cards, setCards] = useState<Flashcard[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showAnswer, setShowAnswer] = useState(false);
//   const [studiedCount, setStudiedCount] = useState(0);
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
//   const [showFeedback, setShowFeedback] = useState(false);
//   const [isCorrect, setIsCorrect] = useState(false);
//   const [shuffledOptions, setShuffledOptions] = useState<
//     typeof currentCard.multipleChoiceOptions
//   >([]);

//   useEffect(() => {
//     if (!deckId) return;
//     const allCards = getCardsByDeck(deckId);
//     console.log("Study page - all cards:", allCards.length, allCards);
//     const dueCards = getDueCards(allCards);
//     console.log("Study page - due cards:", dueCards.length, dueCards);
//     setCards(dueCards);
//   }, [deckId]);

//   const currentCard = cards[currentIndex];

//   // Shuffle multiple choice options when card changes
//   useEffect(() => {
//     if (
//       currentCard?.type === "multiple-choice" &&
//       currentCard.multipleChoiceOptions
//     ) {
//       const shuffled = [...currentCard.multipleChoiceOptions].sort(
//         () => Math.random() - 0.5
//       );
//       setShuffledOptions(shuffled);
//     }
//   }, [currentCard]);

//   const handleReveal = () => {
//     if (currentCard?.type === "multiple-choice") {
//       // For multiple choice, check if selection is correct
//       const correctIds =
//         currentCard.multipleChoiceOptions
//           ?.filter((opt) => opt.isCorrect)
//           .map((opt) => opt.id) || [];
//       const correct =
//         selectedOptions.length === correctIds.length &&
//         selectedOptions.every((id) => correctIds.includes(id));

//       setIsCorrect(correct);
//       setShowFeedback(true);
//     } else {
//       // For both regular and one-sided cards, show the rating buttons
//       setShowAnswer(true);
//     }
//   };

//   const toggleOption = (optionId: string) => {
//     setSelectedOptions((prev) =>
//       prev.includes(optionId)
//         ? prev.filter((id) => id !== optionId)
//         : [...prev, optionId]
//     );
//   };

//   const handleRate = (quality: ReviewQuality) => {
//     if (!currentCard) return;

//     const updates = calculateNextReview(currentCard, quality);
//     const updatedCard = {
//       ...currentCard,
//       ...updates,
//       updatedAt: new Date(),
//     };

//     saveCard(updatedCard);
//     setStudiedCount(studiedCount + 1);

//     if (currentIndex < cards.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       setShowAnswer(false);
//       setSelectedOptions([]);
//       setShowFeedback(false);
//       setIsCorrect(false);
//     } else {
//       toast.success(
//         `Study session complete! Reviewed ${studiedCount + 1} cards.`
//       );
//       router.push("/flashcards");
//     }
//   };

//   const playAudio = () => {
//     if (currentCard?.audioUrl) {
//       const audio = new Audio(currentCard.audioUrl);
//       audio.play();
//     }
//   };

//   if (!currentCard) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center p-4">
//         <Card className="glass max-w-md w-full">
//           <CardContent className="p-8 text-center">
//             <h2 className="text-2xl font-bold mb-4">No cards to study!</h2>
//             <p className="text-muted-foreground mb-6">
//               All cards are up to date. Come back later!
//             </p>
//             <Button onClick={() => router.push("/flashcards")}>
//               Back to Decks
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background p-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex items-center justify-between mb-6">
//           <Button variant="ghost" onClick={() => router.push("/flashcards")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//           <div className="text-muted-foreground">
//             {currentIndex + 1} / {cards.length}
//           </div>
//         </div>

//         <Card className="glass animate-fade-in">
//           <CardContent className="p-8">
//             {!showAnswer ? (
//               <div className="mb-8">
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-sm text-muted-foreground">
//                     {currentCard.type === "multiple-choice"
//                       ? "Select correct answer(s)"
//                       : "Question"}
//                   </h3>
//                   {currentCard.audioUrl && (
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={playAudio}
//                       className="text-primary"
//                     >
//                       <Volume2 className="h-5 w-5" />
//                     </Button>
//                   )}
//                 </div>

//                 <div
//                   className="text-xl mb-6 prose prose-invert max-w-none"
//                   dangerouslySetInnerHTML={{ __html: currentCard.front }}
//                 />

//                 {currentCard.imageUrl && (
//                   <img
//                     src={currentCard.imageUrl}
//                     alt="Card front visual"
//                     className="max-h-64 rounded-lg mx-auto mb-6"
//                   />
//                 )}

//                 {currentCard.type === "multiple-choice" &&
//                   shuffledOptions.length > 0 && (
//                     <div className="space-y-3 mt-6">
//                       {shuffledOptions.map((option) => {
//                         const isSelected = selectedOptions.includes(option.id);
//                         const showCorrectness = showFeedback;
//                         const isCorrectOption = option.isCorrect;

//                         return (
//                           <Button
//                             key={option.id}
//                             variant={isSelected ? "default" : "outline"}
//                             disabled={showFeedback}
//                             className={cn(
//                               "w-full justify-start text-left h-auto py-3 px-4 transition-colors",
//                               showCorrectness &&
//                                 isCorrectOption &&
//                                 "border-success bg-success/10 text-success",
//                               showCorrectness &&
//                                 !isCorrectOption &&
//                                 isSelected &&
//                                 "border-destructive bg-destructive/10 text-destructive"
//                             )}
//                             onClick={() =>
//                               !showFeedback && toggleOption(option.id)
//                             }
//                           >
//                             {option.text}
//                           </Button>
//                         );
//                       })}
//                       {showFeedback && (
//                         <div
//                           className={cn(
//                             "p-4 rounded-lg border-2 mt-4",
//                             isCorrect
//                               ? "border-success bg-success/10 text-success"
//                               : "border-destructive bg-destructive/10 text-destructive"
//                           )}
//                         >
//                           <p className="font-semibold">
//                             {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   )}
//               </div>
//             ) : (
//               <div className="mb-8 space-y-6">
//                 <div>
//                   <div className="flex justify-between items-start mb-4">
//                     <h3 className="text-sm text-muted-foreground">
//                       {currentCard.type === "one-sided"
//                         ? "Content"
//                         : "Question"}
//                     </h3>
//                     {currentCard.audioUrl && (
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={playAudio}
//                         className="text-primary"
//                       >
//                         <Volume2 className="h-5 w-5" />
//                       </Button>
//                     )}
//                   </div>

//                   <div
//                     className="text-lg mb-4 prose prose-invert max-w-none opacity-70"
//                     dangerouslySetInnerHTML={{ __html: currentCard.front }}
//                   />

//                   {currentCard.imageUrl && (
//                     <img
//                       src={currentCard.imageUrl}
//                       alt="Card front visual"
//                       className="max-h-48 rounded-lg mx-auto"
//                     />
//                   )}
//                 </div>

//                 {currentCard.type !== "one-sided" && (
//                   <div className="border-t border-border pt-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <h3 className="text-sm text-muted-foreground">Answer</h3>
//                       {currentCard.backAudioUrl && (
//                         <Button
//                           variant="ghost"
//                           size="icon"
//                           onClick={() => {
//                             if (currentCard.backAudioUrl) {
//                               const audio = new Audio(currentCard.backAudioUrl);
//                               audio.play();
//                             }
//                           }}
//                           className="text-primary"
//                         >
//                           <Volume2 className="h-5 w-5" />
//                         </Button>
//                       )}
//                     </div>

//                     <div
//                       className="text-xl mb-6 prose prose-invert max-w-none"
//                       dangerouslySetInnerHTML={{ __html: currentCard.back }}
//                     />

//                     {currentCard.backImageUrl && (
//                       <img
//                         src={currentCard.backImageUrl}
//                         alt="Card back visual"
//                         className="max-h-64 rounded-lg mx-auto"
//                       />
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {!showAnswer && !showFeedback ? (
//               <Button
//                 onClick={handleReveal}
//                 className="w-full bg-gradient-to-r from-primary to-primary-glow"
//                 disabled={
//                   currentCard.type === "multiple-choice" &&
//                   selectedOptions.length === 0
//                 }
//               >
//                 {currentCard.type === "multiple-choice"
//                   ? "Submit Answer"
//                   : "Show Answer"}
//               </Button>
//             ) : showFeedback ? (
//               <Button
//                 onClick={() => handleRate(isCorrect ? 5 : 1)}
//                 className="w-full bg-gradient-to-r from-primary to-primary-glow"
//               >
//                 Continue
//               </Button>
//             ) : (
//               <div className="space-y-3">
//                 <p className="text-sm text-muted-foreground text-center mb-4">
//                   How well did you know this?
//                 </p>
//                 <div className="grid grid-cols-2 gap-3">
//                   <Button
//                     onClick={() => handleRate(1)}
//                     variant="outline"
//                     className="border-destructive text-destructive hover:bg-destructive/10"
//                   >
//                     Again
//                     <span className="text-xs ml-2 opacity-70">&lt;1min</span>
//                   </Button>
//                   <Button
//                     onClick={() => handleRate(3)}
//                     variant="outline"
//                     className="border-warning text-warning hover:bg-warning/10"
//                   >
//                     Hard
//                     <span className="text-xs ml-2 opacity-70">~10min</span>
//                   </Button>
//                   <Button
//                     onClick={() => handleRate(4)}
//                     variant="outline"
//                     className="border-primary text-primary hover:bg-primary/10"
//                   >
//                     Good
//                     <span className="text-xs ml-2 opacity-70">~4 days</span>
//                   </Button>
//                   <Button
//                     onClick={() => handleRate(5)}
//                     variant="outline"
//                     className="border-success text-success hover:bg-success/10"
//                   >
//                     Easy
//                     <span className="text-xs ml-2 opacity-70">~7 days</span>
//                   </Button>
//                 </div>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/flashcards/ui/button";
import { Card, CardContent } from "@/components/flashcards/ui/card";
import { Flashcard, ReviewQuality } from "@/types/flashcard";
import { getCardsByDeck } from "@/lib/storage";
import { getDueCards, calculateNextReview } from "@/lib/spaced-repetition";
import { saveCard } from "@/lib/storage";
import { ArrowLeft, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Study() {
  const params = useParams<{ deckid: string }>();
  const deckId = params.deckid;
  const router = useRouter();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCount, setStudiedCount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Need to handle options for current card
  const currentCard = cards[currentIndex];
  const [shuffledOptions, setShuffledOptions] = useState<
    typeof currentCard.multipleChoiceOptions
  >([]);

  useEffect(() => {
    const loadCards = async () => {
      if (!deckId) return;
      setIsLoading(true);
      try {
        const allCards = await getCardsByDeck(deckId);
        console.log("Study page - all cards:", allCards.length, allCards);
        const dueCards = getDueCards(allCards);
        console.log("Study page - due cards:", dueCards.length, dueCards);
        setCards(dueCards);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load cards for study");
      } finally {
        setIsLoading(false);
      }
    };

    loadCards();
  }, [deckId]);

  // Shuffle multiple choice options when card changes
  useEffect(() => {
    if (
      currentCard?.type === "multiple-choice" &&
      currentCard.multipleChoiceOptions
    ) {
      const shuffled = [...currentCard.multipleChoiceOptions].sort(
        () => Math.random() - 0.5
      );
      setShuffledOptions(shuffled);
    }
  }, [currentCard]);

  const handleReveal = () => {
    if (currentCard?.type === "multiple-choice") {
      // For multiple choice, check if selection is correct
      const correctIds =
        currentCard.multipleChoiceOptions
          ?.filter((opt) => opt.isCorrect)
          .map((opt) => opt.id) || [];
      const correct =
        selectedOptions.length === correctIds.length &&
        selectedOptions.every((id) => correctIds.includes(id));

      setIsCorrect(correct);
      setShowFeedback(true);
    } else {
      // For both regular and one-sided cards, show the rating buttons
      setShowAnswer(true);
    }
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleRate = async (quality: ReviewQuality) => {
    if (!currentCard) return;

    const updates = calculateNextReview(currentCard, quality);
    const updatedCard = {
      ...currentCard,
      ...updates,
      updatedAt: new Date(),
    };

    try {
      await saveCard(updatedCard);
      setStudiedCount(studiedCount + 1);

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
        setSelectedOptions([]);
        setShowFeedback(false);
        setIsCorrect(false);
      } else {
        toast.success(
          `Study session complete! Reviewed ${studiedCount + 1} cards.`
        );
        router.push("/flashcards");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save progress");
    }
  };

  const playAudio = () => {
    if (currentCard?.audioUrl) {
      const audio = new Audio(currentCard.audioUrl);
      audio.play();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        Loading study session...
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="glass max-w-md w-full">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">No cards to study!</h2>
            <p className="text-muted-foreground mb-6">
              All cards are up to date. Come back later!
            </p>
            <Button onClick={() => router.push("/flashcards")}>
              Back to Decks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.push("/flashcards")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </div>
        </div>

        <Card className="glass animate-fade-in">
          <CardContent className="p-8">
            {!showAnswer ? (
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-sm text-muted-foreground">
                    {currentCard.type === "multiple-choice"
                      ? "Select correct answer(s)"
                      : "Question"}
                  </h3>
                  {currentCard.audioUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={playAudio}
                      className="text-primary"
                    >
                      <Volume2 className="h-5 w-5" />
                    </Button>
                  )}
                </div>

                <div
                  className="text-xl mb-6 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentCard.front }}
                />

                {currentCard.imageUrl && (
                  <img
                    src={currentCard.imageUrl}
                    alt="Card front visual"
                    className="max-h-64 rounded-lg mx-auto mb-6"
                  />
                )}

                {currentCard.type === "multiple-choice" &&
                  shuffledOptions &&
                  shuffledOptions.length > 0 && (
                    <div className="space-y-3 mt-6">
                      {shuffledOptions.map((option) => {
                        const isSelected = selectedOptions.includes(option.id);
                        const showCorrectness = showFeedback;
                        const isCorrectOption = option.isCorrect;

                        return (
                          <Button
                            key={option.id}
                            variant={isSelected ? "default" : "outline"}
                            disabled={showFeedback}
                            className={cn(
                              "w-full justify-start text-left h-auto py-3 px-4 transition-colors",
                              showCorrectness &&
                                isCorrectOption &&
                                "border-success bg-success/10 text-success",
                              showCorrectness &&
                                !isCorrectOption &&
                                isSelected &&
                                "border-destructive bg-destructive/10 text-destructive"
                            )}
                            onClick={() =>
                              !showFeedback && toggleOption(option.id)
                            }
                          >
                            {option.text}
                          </Button>
                        );
                      })}
                      {showFeedback && (
                        <div
                          className={cn(
                            "p-4 rounded-lg border-2 mt-4",
                            isCorrect
                              ? "border-success bg-success/10 text-success"
                              : "border-destructive bg-destructive/10 text-destructive"
                          )}
                        >
                          <p className="font-semibold">
                            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <div className="mb-8 space-y-6">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm text-muted-foreground">
                      {currentCard.type === "one-sided"
                        ? "Content"
                        : "Question"}
                    </h3>
                    {currentCard.audioUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={playAudio}
                        className="text-primary"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>

                  <div
                    className="text-lg mb-4 prose prose-invert max-w-none opacity-70"
                    dangerouslySetInnerHTML={{ __html: currentCard.front }}
                  />

                  {currentCard.imageUrl && (
                    <img
                      src={currentCard.imageUrl}
                      alt="Card front visual"
                      className="max-h-48 rounded-lg mx-auto"
                    />
                  )}
                </div>

                {currentCard.type !== "one-sided" && (
                  <div className="border-t border-border pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm text-muted-foreground">Answer</h3>
                      {currentCard.backAudioUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (currentCard.backAudioUrl) {
                              const audio = new Audio(currentCard.backAudioUrl);
                              audio.play();
                            }
                          }}
                          className="text-primary"
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>

                    <div
                      className="text-xl mb-6 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: currentCard.back }}
                    />

                    {currentCard.backImageUrl && (
                      <img
                        src={currentCard.backImageUrl}
                        alt="Card back visual"
                        className="max-h-64 rounded-lg mx-auto"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {!showAnswer && !showFeedback ? (
              <Button
                onClick={handleReveal}
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
                disabled={
                  currentCard.type === "multiple-choice" &&
                  selectedOptions.length === 0
                }
              >
                {currentCard.type === "multiple-choice"
                  ? "Submit Answer"
                  : "Show Answer"}
              </Button>
            ) : showFeedback ? (
              <Button
                onClick={() => handleRate(isCorrect ? 5 : 1)}
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
              >
                Continue
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleRate(1)}
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Again
                    <span className="text-xs ml-2 opacity-70">&lt;1min</span>
                  </Button>
                  <Button
                    onClick={() => handleRate(3)}
                    variant="outline"
                    className="border-warning text-warning hover:bg-warning/10"
                  >
                    Hard
                    <span className="text-xs ml-2 opacity-70">~10min</span>
                  </Button>
                  <Button
                    onClick={() => handleRate(4)}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    Good
                    <span className="text-xs ml-2 opacity-70">~4 days</span>
                  </Button>
                  <Button
                    onClick={() => handleRate(5)}
                    variant="outline"
                    className="border-success text-success hover:bg-success/10"
                  >
                    Easy
                    <span className="text-xs ml-2 opacity-70">~7 days</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
