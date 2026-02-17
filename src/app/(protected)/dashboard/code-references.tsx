"use client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import React, { useState } from "react";

type Props = {
  fileReferences: { fileName: string; sourceCode: string; summary: string }[];
};

function CodeReferences({ fileReferences }: Props) {
  const [tab, setTab] = useState(fileReferences[0]?.fileName);
  if (fileReferences.length === 0) return null;

  return (
    <div className="max-w-[70vw]">
      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex gap-2 overflow-scroll rounded-md bg-gray-200 p-1">
          {fileReferences.map((file) => (
            <button
              key={file.fileName}
              className={cn(
                `text-muted-foreground hover:bg-muted rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors hover:text-black`,
                {
                  "bg-primary text-primary-foreground hover:bg-blue-800 hover:text-white":
                    tab === file.fileName,
                },
              )}
              onClick={() => setTab(file.fileName)}
            >
              {file.fileName}
            </button>
          ))}
        </div>
        {fileReferences.map((file) => (
          <TabsContent
            key={file.fileName}
            value={file.fileName}
            className="h-full! max-h-[80vh] max-w-7xl overflow-scroll rounded-md"
          >
            <SyntaxHighlighter language="typescript" style={vscDarkPlus}>
              {file.sourceCode}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default CodeReferences;
