import { SidebarPages } from "@/components/Sidebar";
import StudyHubAI from "@/components/ai/StudyHubAI";

import HeaderPages from "@/components/ui/HeaderPages";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <HeaderPages />
      <SidebarPages>{children}</SidebarPages>
      <StudyHubAI />
    </main>
  );
}
