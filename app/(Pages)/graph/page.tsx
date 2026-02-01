"use client";

import Graph from "@/components/notes/Graph";

export default function page() {
  return (
    <div className="min-h-screen h-full antialiased relative  text-foreground overflow-hidden ">
      <Graph classname={"h-full w-full"} />
    </div>
  );
}
