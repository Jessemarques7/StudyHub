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
import { FloatingNav } from "./floating-navbar";

export default async function HeaderPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className=" border-b-blue-950 bg-gradient-to-t from-[#020617] border-b-1  py-2 z-50 px-6 w-full absolute bg-background-secondary  flex 1items-center justify-between">
      <div className="h-8 w-8 ml-12 shrink-0 flex gap-4 items-center justify-center rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm ">
        <Image alt="logo" width={50} height={50} src={"/logo.png"} />
        <span className="font-medium whitespace-pre text-black dark:text-white ">
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

        <DropdownMenuContent align="end" className="bg-slate-900">
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
