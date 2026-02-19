"use client";

import React, { useState, useRef, useEffect } from "react";
import { useDebounce } from "use-debounce";
import { api } from "@/trpc/react";
import { Search } from "lucide-react";

interface SearchBarProps {
  projectId: string;
}

const SearchBar = ({ projectId }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // debounce input
  const [debouncedQuery] = useDebounce(query, 300);

  const { data, isLoading } = api.project.search.useQuery(
    {
      query: debouncedQuery,
      projectId,
    },
    {
      enabled: debouncedQuery.length > 1,
    },
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!data) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev < data.length - 1 ? prev + 1 : prev));
    }

    if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter" && activeIndex >= 0) {
      const selected = data[activeIndex];
      handleSelect(selected);
    }
  };

  const handleSelect = (item: any) => {
    console.log("Selected:", item);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      {/* Input */}
      <div className="flex items-center rounded-lg border px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-gray-400!">
        <Search className="mr-2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search across commits, issues, meetings..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent outline-none"
        />
      </div>

      {/* Dropdown */}
      {open && debouncedQuery.length > 1 && (
        <div className="absolute z-50 mt-2 max-h-80 w-full overflow-y-auto rounded-lg border bg-white shadow-lg">
          {isLoading && (
            <div className="p-3 text-sm text-gray-500">Searching...</div>
          )}

          {!isLoading && data?.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No results found</div>
          )}

          {data?.map((item: any, index: number) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`cursor-pointer p-3 transition ${
                index === activeIndex ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="font-medium">{item.title}</div>
              <div className="text-xs text-gray-500 capitalize">
                {item.type}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
