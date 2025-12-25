"use client";

import { useActionState } from "react"; // Atualizado
import { useFormStatus } from "react-dom";
import { Button } from "@/components/flashcards/ui/button";
import { Input } from "@/components/flashcards/ui/input";
import { Label } from "@/components/flashcards/ui/label";
import { useToast } from "@/hooks/use-toast";
import { updatePassword } from "./actions";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Atualizar Senha
    </Button>
  );
}

export function SecurityForm() {
  // Atualizado
  const [state, formAction] = useActionState(updatePassword, null);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

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
      // Limpar o formulário após sucesso
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="password">Nova Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
