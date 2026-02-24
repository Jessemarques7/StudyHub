import { SidebarPages } from "@/components/Sidebar";

import HeaderPages from "@/components/ui/HeaderPages";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <HeaderPages />
      <SidebarPages>{children}</SidebarPages>
    </main>
  );
}
