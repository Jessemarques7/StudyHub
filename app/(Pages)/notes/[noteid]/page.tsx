import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import Editor from "@/components/Editor";
import Graph from "@/components/Graph";

export default function Notes() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="">
        <SidebarTrigger />
        <div className=" h-[4vh] dark:bg-neutral-800" />
        <div className="flex h-full min-h-screen w-full flex-row bg-neutral-900 overflow-hidden ">
          <Editor />
          <Graph />
        </div>
      </div>
    </SidebarProvider>
  );
}
