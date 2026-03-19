"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface ContributorActivityProps {
  data: any;
  compact?: boolean;
}

const PRESET_COLORS = [
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Violet
  '#06B6D4', // Cyan
  '#F43F5E', // Rose
];

export default function ContributorActivity({ data, compact = false }: ContributorActivityProps) {
  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    
    return data
      .map((contributor) => {
        const totalAdditions = contributor.weeks.reduce((acc: number, w: any) => acc + w.a, 0);
        const totalDeletions = contributor.weeks.reduce((acc: number, w: any) => acc + w.d, 0);
        return {
          name: contributor.author?.login || "Unknown",
          commits: contributor.total || 0,
          additions: totalAdditions,
          deletions: totalDeletions,
          totalImpact: totalAdditions + totalDeletions,
        };
      })
      .sort((a, b) => b.commits - a.commits)
      .slice(0, 8); // Top 8 for focus
  }, [data]);

  const option = useMemo(() => ({
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: [12, 16],
      shadowBlur: 10,
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      textStyle: { fontFamily: 'sup', color: '#1e293b', fontSize: 13 },
      formatter: (params: any) => {
        let res = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 4px;">${params[0].name}</div>`;
        params.forEach((item: any) => {
          res += `<div style="display: flex; justify-content: space-between; gap: 20px; margin-top: 4px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${item.color.colorStops ? item.color.colorStops[0].color : item.color};"></span>
              ${item.seriesName}
            </span>
            <span style="font-weight: 600;">${item.value.toLocaleString()}</span>
          </div>`;
        });
        return res;
      }
    },
    legend: {
      show: !compact,
      top: 10,
      right: 20,
      icon: 'circle',
      textStyle: { fontFamily: 'sup', color: '#64748b', fontSize: 12 }
    },
    grid: {
      top: compact ? 20 : 60,
      left: '4%',
      right: '4%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: chartData.map((d, i) => i === 0 ? `👑 ${d.name}` : d.name),
      axisLabel: {
        fontFamily: 'sup',
        color: '#94a3b8',
        fontSize: 11,
        margin: 15
      },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'sup', color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: [
      {
        name: 'Commits',
        type: 'bar',
        barWidth: '35%',
        data: chartData.map((d, i) => ({
          value: d.commits,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: PRESET_COLORS[i % PRESET_COLORS.length] },
                { offset: 1, color: PRESET_COLORS[i % PRESET_COLORS.length] + '99' }
              ]
            }
          }
        })),
        label: {
          show: !compact,
          position: 'top',
          fontFamily: 'sup',
          fontSize: 10,
          color: '#64748b'
        }
      }
    ]
  }), [chartData, compact]);

  if (!chartData.length) {
    return <div className="h-full w-full flex items-center justify-center text-slate-400 p-8 font-[sup] bg-white">No contributor activity detected.</div>;
  }

  return (
    <div className={`w-full h-full flex flex-col bg-white ${compact ? "p-0" : "p-2"}`}>
      <div className="flex-1 w-full min-h-[350px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
