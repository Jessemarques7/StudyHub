"use client";

import { useActionState } from "react"; // Atualizado: useActionState do 'react'
import { useFormStatus } from "react-dom"; // Nota: Em RC recentes, useFormStatus também pode ter movido para 'react'. Se der erro, mude para 'react'.
import { Button } from "@/components/flashcards/ui/button";
import { Input } from "@/components/flashcards/ui/input";
import { Label } from "@/components/flashcards/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateProfileName } from "./actions";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProfileFormProps {
  currentFullName: string;
  email: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Salvar Alterações
    </Button>
  );
}

export function ProfileForm({ currentFullName, email }: ProfileFormProps) {
  // Atualizado: useActionState retorna [state, formAction, isPending]
  const [state, formAction] = useActionState(updateProfileName, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: state.error,
      });
    } else if (state?.success) {
      toast({
        title: "Sucesso",
        description: state.success,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email} disabled className="bg-muted" />
        <p className="text-[0.8rem] text-muted-foreground">
          O email não pode ser alterado aqui.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={currentFullName}
          required
          minLength={2}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
