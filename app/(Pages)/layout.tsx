import { SidebarPages } from "@/components/Sidebar";

import HeaderPages from "@/components/ui/HeaderPages";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ paddingTop: "var(--header-height)" }}>
      <HeaderPages />
      <SidebarPages>{children}</SidebarPages>
    </main>
  );
}
