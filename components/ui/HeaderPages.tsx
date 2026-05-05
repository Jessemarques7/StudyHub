import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/LogoutButton";
import Image from "next/image";

export default async function HeaderPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="absolute z-50 flex w-full items-center justify-between border-b border-border bg-background-secondary px-6 py-2">
      <div className="h-8 w-8 ml-12 shrink-0 flex gap-4 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm ">
        <Image alt="logo" width={50} height={50} src={"/logo.png"} />
        <span className="font-medium whitespace-pre text-font">
          StudyHub
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url || undefined}
              alt="User Avatar"
            />

            <AvatarFallback>
              {user.user_metadata?.full_name
                ? user.user_metadata.full_name.charAt(0)
                : "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="border-border bg-secondary text-font">
          <DropdownMenuLabel>
            {user.user_metadata?.full_name || "User"}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/account" className="flex items-center space-x-2">
              My Account
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <LogoutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
