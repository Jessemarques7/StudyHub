"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/flashcards/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-red-500 hover:text-red-600 cursor-pointer "
      onClick={handleLogout}
    >
      <LogOut className="mr-2 " />
      Sign Out
    </Button>
  );
}
