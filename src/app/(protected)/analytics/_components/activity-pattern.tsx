"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface ActivityPatternProps {
  commitActivity: any;
  punchCard: any;
  compact?: boolean;
}

export default function ActivityPattern({ commitActivity, punchCard, compact = false }: ActivityPatternProps) {
  const timelineData = useMemo(() => {
    if (!Array.isArray(commitActivity)) return [];
    return commitActivity.map((week: any) => ({
      date: new Date(week.week * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: week.total
    }));
  }, [commitActivity]);

  const punchData = useMemo(() => {
    if (!Array.isArray(punchCard)) return [];
    // punchcard: [day, hour, total]
    return punchCard.map((item: any) => [item[1], item[0], item[2]]);
  }, [punchCard]);

  const timelineOption = {
    backgroundColor: '#ffffff',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { fontFamily: 'sup', color: '#1e293b' },
      padding: [10, 15]
    },
    grid: { top: 30, right: 30, bottom: 40, left: 50 },
    xAxis: {
      type: 'category',
      data: timelineData.map(d => d.date),
      axisLabel: { fontFamily: 'sup', color: '#94a3b8', fontSize: 11 },
      axisLine: { lineStyle: { color: '#f1f5f9' } },
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      axisLabel: { fontFamily: 'sup', color: '#94a3b8', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } }
    },
    series: [{
      data: timelineData.map(d => d.value),
      type: 'line',
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#6366f1', width: 3 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(99, 102, 241, 0.2)' },
            { offset: 1, color: 'rgba(99, 102, 241, 0)' }
          ]
        }
      }
    }]
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}h`);

  const punchOption = {
    backgroundColor: '#ffffff',
    tooltip: {
      position: 'top',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      textStyle: { fontFamily: 'sup', color: '#1e293b' }
    },
    grid: { top: 10, bottom: 60, left: 60, right: 20 },
    xAxis: {
      type: 'category',
      data: hourLabels,
      splitArea: { show: true, areaStyle: { color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.05)'] } },
      axisLabel: { fontFamily: 'sup', fontSize: 10, color: '#94a3b8' },
      axisLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: dayLabels,
      splitArea: { show: true },
      axisLabel: { fontFamily: 'sup', fontSize: 10, color: '#94a3b8' },
      axisLine: { show: false }
    },
    visualMap: {
      min: 0,
      max: Math.max(...punchData.map((d: any) => d[2]), 1),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: ['#f8fafc', '#6366f1'] },
      textStyle: { fontFamily: 'sup', fontSize: 10 }
    },
    series: [{
      name: 'Commit Density',
      type: 'scatter',
      coordinateSystem: 'cartesian2d',
      data: punchData,
      symbolSize: (val: any) => Math.sqrt(val[2]) * 8,
      itemStyle: {
        color: '#6366f1',
        shadowBlur: 10,
        shadowColor: 'rgba(99, 102, 241, 0.2)'
      }
    }]
  };

  return (
    <div className="w-full h-full flex flex-col bg-white p-2">
      <div className="flex-1 flex flex-col gap-8 min-h-[450px]">
        <div className="flex-1 min-h-[200px]">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4" style={{ fontFamily: 'sup' }}>Timeline Velocity</h4>
          <ReactECharts option={timelineOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="flex-1 min-h-[200px]">
           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4" style={{ fontFamily: 'sup' }}>Productivity Punchcard</h4>
          <ReactECharts option={punchOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
    </div>
  );
}
