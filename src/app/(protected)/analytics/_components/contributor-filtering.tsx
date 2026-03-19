"use client";

import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import { Check, ChevronsUpDown, Fingerprint, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ContributorFilteringProps {
  data: any;
}

const LINE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ContributorFiltering({ data }: ContributorFilteringProps) {
  const [open, setOpen] = useState(false);
  const [selectedContributors, setSelectedContributors] = useState<string[]>([]);

  const contributors = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((c: any) => c.author?.login).filter(Boolean);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    // Default to top 4 if none selected for a "dispersed" initial view
    const targets = selectedContributors.length > 0
      ? data.filter(c => selectedContributors.includes(c.author?.login))
      : data.slice(0, 4);

    return targets.map((c, idx) => {
      const weeks = c.weeks.slice(-20);
      const categories = weeks.map((w: any) => new Date(w.w * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      const commitPoints = weeks.map((w: any) => w.c);

      return {
        name: c.author?.login,
        color: LINE_COLORS[idx % LINE_COLORS.length],
        categories,
        data: commitPoints,
        total: c.total,
        impact: weeks.reduce((acc: number, w: any) => acc + w.a + w.d, 0)
      };
    });
  }, [data, selectedContributors]);

  const getOption = (item: any) => ({
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#f1f5f9',
      borderWidth: 1,
      textStyle: { fontFamily: 'sup', color: '#1e293b', fontSize: 10 }
    },
    grid: { top: 10, right: 10, bottom: 30, left: 30 },
    xAxis: {
      type: 'category',
      data: item.categories,
      axisLabel: { show: false },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'sup', fontSize: 9, color: '#cbd5e1' },
      splitLine: { lineStyle: { color: '#f8fafc' } }
    },
    series: [{
      name: 'Commits',
      type: 'line',
      smooth: true,
      data: item.data,
      symbol: 'none',
      lineStyle: { width: 3, color: item.color },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: `${item.color}33` },
            { offset: 1, color: `${item.color}00` }
          ]
        }
      }
    }]
  });

  return (
    <div className="w-full h-full flex flex-col bg-slate-50/20">
      {/* Header / Selector */}
      <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-md">
            <Fingerprint className="size-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight" style={{ fontFamily: 'sup' }}>Individual Stats Explorer</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5" style={{ fontFamily: 'sup' }}>Dispersed Tactical Attribution</p>
          </div>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="px-10 py-6 rounded-md border-slate-200 shadow-sm bg-white hover:bg-slate-50 text-xs font-black uppercase tracking-tight text-slate-600"
              style={{ fontFamily: 'sup' }}
            >
              {selectedContributors.length === 0
                ? "Select Contributors"
                : `${selectedContributors.length} Nodes Locked`}
              <ChevronsUpDown className="ml-4 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 rounded-md border-slate-100 shadow-lg">
            <Command className="rounded-md">
              <CommandInput placeholder="Search node signature..." className="text-xs font-medium h-12" />
              <CommandList>
                <CommandEmpty>No signature detected.</CommandEmpty>
                <CommandGroup>
                  {contributors.map((contributor) => (
                    <CommandItem
                      key={contributor}
                      value={contributor}
                      onSelect={() => {
                        setSelectedContributors(prev =>
                          prev.includes(contributor)
                            ? prev.filter(c => c !== contributor)
                            : [...prev, contributor]
                        );
                      }}
                      className="text-xs font-bold px-4 py-3"
                      style={{ fontFamily: 'sup' }}
                    >
                      <Check
                        className={cn(
                          "mr-3 h-4 w-4 text-indigo-600",
                          selectedContributors.includes(contributor) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {contributor}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Dispersed Grid */}
      <div className="p-8 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8">
          {filteredData.map((item, idx) => (
            <div key={item.name} className="bg-white rounded-md border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 group overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 group-hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md flex items-center justify-center font-black text-white text-xs" style={{ backgroundColor: item.color, fontFamily: 'sup' }}>
                    {item.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-black text-slate-800 tracking-tight" style={{ fontFamily: 'sup' }}>{item.name}</span>
                </div>
                <Zap className="size-3 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>

              <div className="p-4 h-48">
                <ReactECharts option={getOption(item)} style={{ height: '100%', width: '100%' }} />
              </div>

              <div className="px-6 py-4 bg-slate-50/50 flex items-center justify-between border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Velocity</span>
                  <span className="text-xs font-black text-slate-700" style={{ fontFamily: 'sup' }}>{item.total} Commits</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Impact</span>
                  <span className="text-xs font-black text-slate-700" style={{ fontFamily: 'sup' }}>{item.impact.toLocaleString()} Lines</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
}
