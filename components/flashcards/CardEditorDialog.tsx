import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/flashcards/ui/dialog";
import { Button } from "@/components/flashcards/ui/button";
import { Input } from "@/components/flashcards/ui/input";
import { Label } from "@/components/flashcards/ui/label";
import { RichTextEditor } from "./RichTextEditor";
import {
  Flashcard,
  FlashcardType,
  MultipleChoiceOption,
} from "@/types/flashcard";
import { Badge } from "@/components/flashcards/ui/badge";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/flashcards/ui/select";
import { Checkbox } from "@/components/flashcards/ui/checkbox";

interface CardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (card: Partial<Flashcard>) => void;
  card?: Flashcard;
  deckId: string;
}

export function CardEditorDialog({
  open,
  onOpenChange,
  onSave,
  card,
  deckId,
}: CardEditorDialogProps) {
  const [cardType, setCardType] = useState<FlashcardType>("regular");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [imageUrl, setImageUrl] = useState<string>();
  const [audioUrl, setAudioUrl] = useState<string>();
  const [backImageUrl, setBackImageUrl] = useState<string>();
  const [backAudioUrl, setBackAudioUrl] = useState<string>();
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<
    MultipleChoiceOption[]
  >([
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
  ]);

  useEffect(() => {
    if (card) {
      setCardType(card.type || "regular");
      setFront(card.front);
      setBack(card.back);
      setTags(card.tags);
      setImageUrl(card.imageUrl);
      setAudioUrl(card.audioUrl);
      setBackImageUrl(card.backImageUrl);
      setBackAudioUrl(card.backAudioUrl);
      setMultipleChoiceOptions(
        card.multipleChoiceOptions || [
          { id: crypto.randomUUID(), text: "", isCorrect: false },
          { id: crypto.randomUUID(), text: "", isCorrect: false },
        ]
      );
    } else {
      setCardType("regular");
      setFront("");
      setBack("");
      setTags([]);
      setImageUrl(undefined);
      setAudioUrl(undefined);
      setBackImageUrl(undefined);
      setBackAudioUrl(undefined);
      setMultipleChoiceOptions([
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ]);
    }
  }, [card, open]);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
      toast.success("Image added");
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAudioUrl(e.target?.result as string);
      toast.success("Audio added");
    };
    reader.readAsDataURL(file);
  };

  const handleBackImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackImageUrl(e.target?.result as string);
      toast.success("Back image added");
    };
    reader.readAsDataURL(file);
  };

  const handleBackAudioUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setBackAudioUrl(e.target?.result as string);
      toast.success("Back audio added");
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddOption = () => {
    setMultipleChoiceOptions([
      ...multipleChoiceOptions,
      { id: crypto.randomUUID(), text: "", isCorrect: false },
    ]);
  };

  const handleRemoveOption = (id: string) => {
    if (multipleChoiceOptions.length > 2) {
      setMultipleChoiceOptions(
        multipleChoiceOptions.filter((opt) => opt.id !== id)
      );
    }
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setMultipleChoiceOptions(
      multipleChoiceOptions.map((opt) =>
        opt.id === id ? { ...opt, text } : opt
      )
    );
  };

  const handleOptionCorrectChange = (id: string, isCorrect: boolean) => {
    setMultipleChoiceOptions(
      multipleChoiceOptions.map((opt) =>
        opt.id === id ? { ...opt, isCorrect } : opt
      )
    );
  };

  const handleSubmit = () => {
    if (!front.trim()) {
      toast.error("Front is required");
      return;
    }

    if (cardType === "regular" && !back.trim()) {
      toast.error("Back is required for regular cards");
      return;
    }

    if (cardType === "multiple-choice") {
      const validOptions = multipleChoiceOptions.filter((opt) =>
        opt.text.trim()
      );
      if (validOptions.length < 2) {
        toast.error("At least 2 options are required");
        return;
      }
      if (!validOptions.some((opt) => opt.isCorrect)) {
        toast.error("At least one correct answer is required");
        return;
      }
    }

    const now = new Date();
    const initialNextReview =
      card?.nextReview || new Date(now.setHours(0, 0, 0, 0));

    onSave({
      ...card,
      deckId,
      type: cardType,
      front: front.trim(),
      back: back.trim(),
      tags,
      imageUrl,
      audioUrl,
      backImageUrl,
      backAudioUrl,
      multipleChoiceOptions:
        cardType === "multiple-choice"
          ? multipleChoiceOptions.filter((opt) => opt.text.trim())
          : undefined,
      updatedAt: new Date(),
      createdAt: card?.createdAt || new Date(),
      easeFactor: card?.easeFactor || 2.5,
      interval: card?.interval || 0,
      repetitions: card?.repetitions || 0,
      nextReview: initialNextReview,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{card ? "Edit Card" : "Create New Card"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label className="mb-2 block">Card Type</Label>
            <Select
              value={cardType}
              onValueChange={(value) => setCardType(value as FlashcardType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular (Front & Back)</SelectItem>
                <SelectItem value="one-sided">
                  One-Sided (Front Only)
                </SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Front</Label>
            <RichTextEditor
              value={front}
              onChange={setFront}
              onImageUpload={handleImageUpload}
              onAudioUpload={handleAudioUpload}
              placeholder="Enter the question or prompt..."
            />
          </div>

          {cardType === "regular" && (
            <div>
              <Label className="mb-2 block">Back</Label>
              <RichTextEditor
                value={back}
                onChange={setBack}
                onImageUpload={handleBackImageUpload}
                onAudioUpload={handleBackAudioUpload}
                placeholder="Enter the answer..."
              />
            </div>
          )}

          {cardType === "multiple-choice" && (
            <div>
              <Label className="mb-2 block">Answer Options</Label>
              <div className="space-y-3">
                {multipleChoiceOptions.map((option, index) => (
                  <div key={option.id} className="flex gap-2 items-start">
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) =>
                        handleOptionCorrectChange(option.id, checked as boolean)
                      }
                      className="mt-3"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) =>
                        handleOptionTextChange(option.id, e.target.value)
                      }
                      placeholder={`Option ${index + 1}`}
                      className="flex-1"
                    />
                    {multipleChoiceOptions.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label className="mb-2 block">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="Add a tag..."
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {imageUrl && (
            <div>
              <Label className="mb-2 block">Image Preview</Label>
              <img src={imageUrl} alt="Card" className="max-h-48 rounded-lg" />
            </div>
          )}

          {audioUrl && (
            <div>
              <Label className="mb-2 block">Front Audio Preview</Label>
              <audio src={audioUrl} controls className="w-full" />
            </div>
          )}

          {backImageUrl && (
            <div>
              <Label className="mb-2 block">Back Image Preview</Label>
              <img
                src={backImageUrl}
                alt="Back card"
                className="max-h-48 rounded-lg"
              />
            </div>
          )}

          {backAudioUrl && (
            <div>
              <Label className="mb-2 block">Back Audio Preview</Label>
              <audio src={backAudioUrl} controls className="w-full" />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Card</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
