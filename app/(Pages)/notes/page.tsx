import { SidebarDemo } from "@/components/app-sidebar-aceternity";
import Editor from "@/components/Editor";
import Graph from "@/components/Graph";

export default function NotePage() {
  return (
    <SidebarDemo>
      {/* Main content area */}
      <div className="flex h-screen flex-row bg-neutral-900 overflow-hidden">
        <Editor />
        <Graph />
      </div>
    </SidebarDemo>
  );
}
