"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "motion/react";
import {
  IconCalendarFilled,
  IconCards,
  IconFile,
  IconMessage,

  IconTargetArrow,
} from "@tabler/icons-react";
import { LogOut, UserRound } from "lucide-react";
import React, { useState } from "react";

import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Study AI",
    icon: IconMessage,
    href: "/home",
  },
  {
    label: "Notes",
    icon: IconFile,
    href: "/notes",
  },
  {
    label: "Flashcards",
    icon: IconCards,
    href: "/flashcards",
  },
  {
    label: "Habits",
    icon: IconTargetArrow,
    href: "/habits",
  },
  {
    label: "Calendar",
    icon: IconCalendarFilled,
    href: "/calendar",
  },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "U";
}

function Logo() {
  return (
    <a
      href="/home"
      className="relative z-20 flex items-center gap-2 py-1 text-sm font-normal text-foreground"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        <Image
          alt="StudyHub"
          width={28}
          height={28}
          src="/logo.png"
          className="h-7 w-7 object-contain"
          priority
        />
      </span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-foreground"
      >
        StudyHub
      </motion.span>
    </a>
  );
}

function LogoIcon() {
  return (
    <a
      href="/home"
      className="relative z-20 flex items-center py-1 text-sm font-normal text-foreground"
      aria-label="StudyHub home"
    >
      <Image
        alt=""
        width={28}
        height={28}
        src="/logo.png"
        className="h-7 w-7 shrink-0 object-contain"
        priority
      />
    </a>
  );
}

function UserMenu({
  userAvatarUrl,
  userName,
  active,
}: {
  userAvatarUrl?: string | null;
  userName: string;
  active: boolean;
}) {
  const router = useRouter();
  const { open, animate } = useSidebar();

  const handleLogout = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          aria-current={active ? "page" : undefined}
          className={cn(
            "group/sidebar flex w-full items-center justify-start gap-2 rounded-md py-2 text-left text-muted-foreground outline-none transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-complement/40",
            active && "text-complement",
          )}
        >
          <Avatar className="h-7 w-7 shrink-0 border border-border">
            <AvatarImage src={userAvatarUrl || undefined} alt={userName} />
            <AvatarFallback className="bg-third text-xs text-font">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          <motion.span
            animate={{
              display: animate
                ? open
                  ? "inline-block"
                  : "none"
                : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="inline-block whitespace-pre text-sm text-current transition duration-150 group-hover/sidebar:translate-x-1 !m-0 !p-0"
          >
            {userName}
          </motion.span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="right"
        align="end"
        className="border-border bg-secondary text-font"
      >
        <DropdownMenuLabel className="max-w-48 truncate">
          {userName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push("/account")}>
          <UserRound className="h-4 w-4" />
          My Account
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SidebarPages({
  children,
  userAvatarUrl,
  userName = "User",
}: {
  children: React.ReactNode;
  userAvatarUrl?: string | null;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background text-foreground md:flex-row">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 border-border bg-secondary md:border-r">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}

            <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
              {links.map((link) => {
                const Icon = link.icon;
                const active = isActiveRoute(pathname, link.href);

                return (
                  <SidebarLink
                    key={link.href}
                    link={{
                      label: link.label,
                      href: link.href,
                      icon: <Icon className="h-5 w-5 shrink-0" />,
                    }}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md text-muted-foreground transition hover:text-foreground",
                      active && "text-complement",
                    )}
                  />
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border pt-3">
            <UserMenu
              userAvatarUrl={userAvatarUrl}
              userName={userName}
              active={isActiveRoute(pathname, "/account")}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</div>
    </div>
  );
}
