import { SidebarPages } from "@/components/Sidebar";
import StudyHubAI from "@/components/ai/StudyHubAI";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userName =
    typeof user.user_metadata?.full_name === "string" &&
    user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name
      : "User";
  const userAvatarUrl =
    typeof user.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url
      : null;

  return (
    <main>
      <SidebarPages userName={userName} userAvatarUrl={userAvatarUrl}>
        {children}
      </SidebarPages>
      <StudyHubAI />
    </main>
  );
}
