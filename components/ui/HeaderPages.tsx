import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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

export default async function HeaderPages() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className=" py-3 z-50 px-6 w-full  bg-background-secondary  flex items-center justify-between">
      <div></div>

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
