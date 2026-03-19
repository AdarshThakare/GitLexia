"use client";

import React, { useMemo } from "react";
import { Brain, Cpu, MessageSquare, Zap, Target, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContributorGistsProps {
  stats: any[];
  commits: any[];
}

export default function ContributorGists({ stats, commits }: ContributorGistsProps) {
  const authorGists = useMemo(() => {
    if (!stats || !commits) return [];

    return stats.map(stat => {
      const login = stat.author?.login;
      const authorCommits = commits.filter(c => c.commitAuthorName === login || c.commitAuthorName === stat.author?.name);

      // Extract unique bullet points from summaries
      const uniqueGists = Array.from(new Set(
        authorCommits
          .map(c => c.summary)
          .filter(Boolean)
          .flatMap(s => s.split('\n'))
          .map(line => line.replace(/^[*-]\s*/, '').trim())
          .filter(line => line.length > 5 && line.length < 150)
      )).slice(0, 5); // Limit to top 5 for "gist" feel

      return {
        login,
        avatar: stat.author?.avatar_url,
        totalCommits: stat.total,
        gists: uniqueGists,
        primaryFocus: uniqueGists.length > 0 ? "Strategic Development" : "Infrastructure & Maintenance"
      };
    }).sort((a, b) => b.totalCommits - a.totalCommits);
  }, [stats, commits]);

  if (authorGists.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {authorGists.map((author, idx) => (
        <Card key={author.login} className="bg-white border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group hover:border-indigo-200 transition-all duration-500">
          <div className="py-2 px-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30 group-hover:bg-indigo-50/20 transition-colors">
            <div className="flex items-center gap-5">
              <div className="relative">
                <img src={author.avatar} alt={author.login} className="size-14 rounded-md border-2 border-white shadow-sm" />
                <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900" style={{ fontFamily: 'sup' }}>{author.login}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <Target className="size-3 text-indigo-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>{author.primaryFocus}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-slate-900" style={{ fontFamily: 'sup' }}>{author.totalCommits}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Total Node Weight</p>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="size-4 text-indigo-600" />
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'sup' }}>Functional Intelligence Gist</h5>
            </div>

            <div className="space-y-4">
              {author.gists.length > 0 ? (
                author.gists.map((gist, i) => (
                  <div key={i} className="flex gap-4 group/item">
                    <div className="mt-1.5 size-1.5 rounded-full bg-slate-200 group-hover/item:bg-indigo-400 transition-colors shrink-0" />
                    <p className="text-sm font-medium text-slate-600 leading-relaxed transition-colors group-hover/item:text-slate-900" style={{ fontFamily: 'sup' }}>
                      {gist}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
                  <Cpu className="size-8 mb-3 text-slate-300" />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ fontFamily: 'sup' }}>No semantic data indexed</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
