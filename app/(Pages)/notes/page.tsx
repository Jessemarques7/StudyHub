"use client";

import Editor from "@/components/notes/Editor";

export default function NotePage() {
  return (
    <>
      {/* Main content area */}

      <div className="flex flex-row overflow-hidden relative">
        <Editor />
      </div>
    </>
  );
}
