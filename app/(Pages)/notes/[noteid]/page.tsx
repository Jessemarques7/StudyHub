import { SidebarDemo } from "@/components/app-sidebar-aceternity";
import Editor from "@/components/Editor";
import Graph from "@/components/Graph";

export default function NotePage() {
  return (
    <SidebarDemo>
      {/* Main content area */}
      <div className="h-6 bg-slate-950 rounded-tl-2xl "></div>
      <div className="flex h-screen flex-row  overflow-hidden">
        <Editor />
        <Graph />
      </div>
    </SidebarDemo>
  );
}
