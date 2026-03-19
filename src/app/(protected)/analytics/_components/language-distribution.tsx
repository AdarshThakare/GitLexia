"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface LanguageDistributionProps {
  languages: Record<string, number>;
}

const PREMIUM_PALETTE = ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4', '#4f46e5'];

export default function LanguageDistribution({ languages }: LanguageDistributionProps) {
  const data = useMemo(() => {
    if (!languages) return [];
    const total = Object.values(languages).reduce((acc, curr) => acc + curr, 0);
    return Object.entries(languages).map(([name, value], idx) => ({
      name,
      value,
      percent: ((value / total) * 100).toFixed(1),
      itemStyle: { color: PREMIUM_PALETTE[idx % PREMIUM_PALETTE.length] }
    })).sort((a, b) => b.value - a.value);
  }, [languages]);

  const option = {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#ffffff',
      borderColor: '#f1f5f9',
      textStyle: { fontFamily: 'sup', color: '#1e293b' }
    },
    series: [{
      name: 'Languages',
      type: 'treemap',
      visibleMin: 300,
      label: { show: true, formatter: '{b}\n{d}%', fontFamily: 'sup', fontSize: 11, fontWeight: 700 },
      itemStyle: { borderColor: '#ffffff', borderWidth: 2, gapWidth: 2 },
      breadcrumb: { show: false },
      data: data,
    }]
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white">
      <div className="mb-2">
        <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Technology Matrix</h3>
        <p className="text-[10px] text-slate-400 font-bold" style={{ fontFamily: 'sup' }}>Density distribution of the codebase.</p>
      </div>
      <div className="flex-1 w-full h-[300px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
