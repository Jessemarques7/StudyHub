import { SidebarDemo } from "@/components/SidebarDemo";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <SidebarDemo>{children}</SidebarDemo>
    </main>
  );
}
