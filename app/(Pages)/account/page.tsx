import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/flashcards/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/flashcards/ui/tabs";
import { Separator } from "@/components/flashcards/ui/separator";
import { ProfileForm } from "./profile-form";
import { SecurityForm } from "./security-form";
import { AvatarUpload } from "./avatar-upload";

export default async function AccountPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Extrair dados do usuário (metadata)
  const fullName = user.user_metadata?.full_name || "";
  const email = user.email || "";
  const avatarUrl = user.user_metadata?.avatar_url || null;

  return (
    <div className="container w-full py-16 px-32 bg-slate-950">
      <div className="space-y-0.5 mb-8">
        <h2 className="text-2xl font-bold tracking-tight">
          Configurações da Conta
        </h2>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e segurança.
        </p>
      </div>
      <Separator className="my-6" />

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        {/* ABA DE PERFIL */}
        <TabsContent value="profile" className="space-y-8">
          {/* Seção de Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Perfil</CardTitle>
              <CardDescription>
                Clique na imagem para alterar sua foto de exibição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvatarUpload currentAvatarUrl={avatarUrl} userName={fullName} />
            </CardContent>
          </Card>

          {/* Seção de Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seu nome de exibição.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm currentFullName={fullName} email={email} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA DE SEGURANÇA */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Senha</CardTitle>
              <CardDescription>
                Redefina sua senha. Escolha uma senha forte e segura.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecurityForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
