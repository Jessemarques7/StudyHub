"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validar alteração de nome
const profileSchema = z.object({
  fullName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
});

// Schema para validar alteração de senha
const passwordSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export async function updateProfileName(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Verifica se o usuário está autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Usuário não autenticado." };

  const fullName = formData.get("fullName") as string;

  // Validação Zod
  const parsed = profileSchema.safeParse({ fullName });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Atualiza os metadados do usuário no Supabase Auth
  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (error) return { error: error.message };

  revalidatePath("/account");
  return { success: "Nome atualizado com sucesso!" };
}

export async function updatePassword(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validação Zod
  const parsed = passwordSchema.safeParse({ password, confirmPassword });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Atualiza a senha
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  return { success: "Senha atualizada com sucesso!" };
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();

  // 1. Verificar usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const file = formData.get("avatar") as File;

  if (!file || file.size === 0) {
    return { error: "Nenhum arquivo selecionado." };
  }

  // Validação básica de tipo de arquivo
  if (!file.type.startsWith("image/")) {
    return { error: "O arquivo deve ser uma imagem." };
  }

  // Validação de tamanho (ex: max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "A imagem deve ter no máximo 2MB." };
  }

  // 2. Criar um nome de arquivo único caminho
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`; // Caminho dentro do bucket 'avatars'

  // 3. Fazer upload para o Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { error: "Erro ao fazer upload da imagem: " + uploadError.message };
  }

  // 4. Obter a URL pública da imagem
  const { data: publicUrlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = publicUrlData.publicUrl;

  // 5. Atualizar o perfil do usuário com a nova URL do avatar
  const { error: updateUserError } = await supabase.auth.updateUser({
    data: { avatar_url: avatarUrl },
  });

  if (updateUserError) {
    return {
      error: "Erro ao atualizar perfil com foto: " + updateUserError.message,
    };
  }

  revalidatePath("/account");
  // Retornamos a nova URL para atualizar a UI imediatamente
  return { success: "Foto de perfil atualizada!", newAvatarUrl: avatarUrl };
}
