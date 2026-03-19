"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface RepositoryRadarProps {
  stats: any;
  commits: any;
  punchCard: any;
}

export default function RepositoryRadar({ stats, commits, punchCard }: RepositoryRadarProps) {
  const radarData = useMemo(() => {
    if (!stats || !commits || !punchCard) return null;

    const recentCommits = commits.slice(-12);
    const avgVelocity = recentCommits.reduce((acc: number, curr: any) => acc + curr.total, 0) / 12;
    const velocityScore = Math.min((avgVelocity / 20) * 100, 100);
    const participationScore = Math.min((stats.length / 5) * 100, 100);
    const busyHours = punchCard.filter((p: any) => p[2] > 0).length;
    const intensityScore = Math.min((busyHours / 40) * 100, 100);
    const activeWeeks = commits.filter((c: any) => c.total > 0).length;
    const consistencyScore = (activeWeeks / commits.length) * 100;
    const totalAdd = stats.reduce((acc: number, curr: any) => acc + curr.weeks.reduce((wAcc: number, w: any) => wAcc + w.a, 0), 0);
    const totalDel = stats.reduce((acc: number, curr: any) => acc + curr.weeks.reduce((wAcc: number, w: any) => wAcc + w.d, 0), 0);
    const impactScore = Math.min((totalAdd / (totalDel || 1)) * 50, 100);

    return [velocityScore, participationScore, intensityScore, consistencyScore, impactScore];
  }, [stats, commits, punchCard]);

  const option = {
    backgroundColor: '#ffffff',
    radar: {
      indicator: [
        { name: 'Velocity', max: 100 },
        { name: 'Participation', max: 100 },
        { name: 'Intensity', max: 100 },
        { name: 'Consistency', max: 100 },
        { name: 'Impact', max: 100 }
      ],
      shape: 'polygon',
      axisName: { color: '#94a3b8', fontFamily: 'sup', fontSize: 10, fontWeight: 600 },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: '#f1f5f9' } }
    },
    series: [{
      name: 'Repository DNA',
      type: 'radar',
      data: [{
        value: radarData || [0, 0, 0, 0, 0],
        name: 'Genetic Snapshot',
        areaStyle: {
          color: {
            type: 'radial',
            x: 0.5, y: 0.5, r: 0.5,
            colorStops: [
              { offset: 0, color: 'rgba(99, 102, 241, 0.6)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.2)' }
            ]
          }
        },
        lineStyle: { color: '#6366f1', width: 2 },
        itemStyle: { color: '#6366f1' }
      }]
    }],
    tooltip: { trigger: 'item', textStyle: { fontFamily: 'sup' } }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-white">
      <div className="mb-2">
        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Repository DNA</h3>
        <p className="text-[10px] text-slate-400 font-bold" style={{ fontFamily: 'sup' }}>Genetic mapping of dev velocity & impact.</p>
      </div>
      <div className="flex-1 w-full h-[300px]">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
}
