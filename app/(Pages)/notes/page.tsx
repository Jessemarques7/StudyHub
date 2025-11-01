import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div>
        <SidebarTrigger />
        <div className="flex h-full min-h-screen w-full flex-row bg-neutral-900 overflow-hidden "></div>
      </div>
    </SidebarProvider>
  );
}
