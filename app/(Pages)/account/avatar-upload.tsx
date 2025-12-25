"use client";

import { useState, useRef } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/flashcards/ui/avatar";
import { Button } from "@/components/flashcards/ui/button";
import { Loader2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadAvatar } from "./actions";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  userName: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  userName,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "US";

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Pré-visualização imediata
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    setIsUploading(false);
    // Limpar a URL do objeto
    URL.revokeObjectURL(objectUrl);

    if (result.error) {
      setPreviewUrl(currentAvatarUrl);
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: result.error,
      });
    } else {
      setPreviewUrl(result.newAvatarUrl!);
      toast({
        title: "Sucesso",
        description: result.success,
      });
    }
    // Resetar input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex items-center gap-x-6">
      <Avatar
        className="h-24 w-24 cursor-pointer hover:opacity-90 transition-opacity relative group"
        onClick={() => fileInputRef.current?.click()}
      >
        {/* CORREÇÃO AQUI: Usar undefined se previewUrl for nulo ou vazio */}
        <AvatarImage
          src={previewUrl || undefined}
          alt={userName}
          className="object-cover"
        />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <UploadCloud className="text-white h-8 w-8" />
        </div>
      </Avatar>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileSelect}
      />

      <div>
        <h4 className="font-medium">{userName || "Usuário"}</h4>
        <p className="text-sm text-muted-foreground mb-2">
          JPG, GIF ou PNG. Max 2MB.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
            </>
          ) : (
            "Alterar Foto"
          )}
        </Button>
      </div>
    </div>
  );
}
