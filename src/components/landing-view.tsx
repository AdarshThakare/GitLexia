"use client";

import React from "react";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { motion } from "framer-motion";
import {
  Github,
  Video,
  MessageSquare,
  Zap,
  CheckCircle2,
  Terminal,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  LayoutDashboard
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ProjectShowcase } from "@/components/ui/project-showcase";
import type { ProjectStep } from "@/components/ui/project-showcase";
import { MagneticText } from "@/components/ui/morphing-cursor";

const architectureSteps: ProjectStep[] = [
  {
    title: "Git Repository Connection",
    description: "Linking of your Github Repository Codebase for semantic data indexing",
    year: "Step 01",
    link: "#",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Commit Data Extraction",
    description: "Real-time scanning and extraction of commit history, diffs, and metadata.",
    year: "Step 02",
    link: "#",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Advanced Logical Mapping",
    description: "AI-driven logic mapping, pattern recognition, and semantic summarization.",
    year: "Step 03",
    link: "#",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Visualization Engine",
    description: "Converting multidimensional data into an intuitive, high-performance UI.",
    year: "Step 04",
    link: "#",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Interactive Analytics",
    description: "A centralized command center for your entire engineering project.",
    year: "Step 05",
    link: "#",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2670&auto=format&fit=crop",
  },
];

const featureSteps: ProjectStep[] = [
  {
    title: "Code Summaries",
    description: "Automatic explanations for every commit and pull request. See the logic behind the changes at a glance.",
    year: "Feature",
    link: "#",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "Meeting Reports",
    description: "Turn your meeting recordings into actionable reports and searchable transcripts with zero effort.",
    year: "Feature",
    link: "#",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2670&auto=format&fit=crop",
  },
  {
    title: "AI Chat",
    description: "Ask questions about your codebase and get reliable answers instantly. It's like having a senior dev on call.",
    year: "Feature",
    link: "#",
    image: "https://plus.unsplash.com/premium_photo-1676057060928-c717a8e96784?q=80&w=1616&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

const GitLexiaLanding = ({ onExplore }: { onExplore?: () => void }) => {
  const router = useRouter();

  return (
    <div className="relative w-full bg-white overflow-x-hidden scroll-smooth transition-all duration-500">
      {/* Branding Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 md:p-10 pointer-events-none">
        <div className="container mx-auto px-6 max-w-6xl flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group pointer-events-auto">
            <div className="size-10 md:size-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl  transition-transform overflow-hidden p-0">
              <Image
                src="/icon.png"
                alt="logo"
                width={48}
                height={48}
                className="object-cover size-full"
              />
            </div>
            <span className="font-extrabold text-xl md:text-2xl text-slate-900 tracking-[0.15em] uppercase group-hover:text-indigo-600 transition-colors">GITLEXIA</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <BackgroundPaths
          title="Codebase Analysis for Everyone."
          subtitle="Understand your code, summarize your meetings, and track project health with ease. A powerful dashboard designed for developers, managers, and teams."
        />
      </section>

      {/* Features Section - Now using ProjectShowcase exclusively */}
      <section className="container mx-auto px-6 py-32 max-w-6xl">
        <div className="flex flex-col items-center text-center mb-16">

          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tighter">
            Smart Insights. <span className="text-indigo-600">Simplified.</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            Everything you need to master your engineering data, presented in a clean, interactive showcase.
          </p>
        </div>

        <ProjectShowcase steps={featureSteps} label="Advanced Tooling" />
      </section>

      {/* Architecture Section - Dark Theme */}
      <section id="features-section" className="bg-slate-950 py-32 border-y border-white/11 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
            >
              Flow of the Gitlexia <span className="text-indigo-400">Pipeline</span>
            </motion.h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
              Our technical architecture designed for high-performance data orchestration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {architectureSteps.map((step, index) => (
              <ArchitectureCard key={step.title} step={step} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Call to Action */}
      <section className="py-40 bg-white overflow-hidden">
        <div className="container mx-auto px-6 text-center max-w-5xl">
          <div className="mb-20">
            <MagneticText
              text="READY TO EVOLVE?"
              hoverText="LET'S GO"
              className="mb-4"
            />
            <p className="text-2xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mt-8 transition-all hover:text-slate-900">
              Experience the future of engineering collaboration.
              Simple, clear, and powerful analysis for the whole team.
            </p>
          </div>

          <div className="flex flex-col items-center gap-12 group">
            {/* Command Line Style Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              onClick={() => router.push("/create")}
              className="bg-slate-900 text-slate-50 px-8 py-5 rounded-xl font-mono text-lg flex items-center gap-4 border border-slate-700 hover:border-indigo-500 hover:shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all active:scale-95 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <Terminal className="size-5 text-indigo-400" />
              <span className="flex items-center gap-1">
                <span className="text-indigo-400">$</span>
                <span>npx gitlexia start</span>
              </span>
              <ArrowRight className="size-5 ml-4 group-hover/btn:translate-x-2 transition-transform" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-[0.3em] opacity-50"
            >
              <CheckCircle2 className="size-4 text-emerald-500" />
              Secure & Open Source
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-slate-100 bg-slate-50/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg overflow-hidden p-0">
                <Image
                  src="/icon.png"
                  alt="logo"
                  width={40}
                  height={40}
                  className="object-cover size-full"
                />
              </div>
              <span className="font-extrabold text-2xl text-slate-900 tracking-[0.1em] uppercase">GitLexia</span>
            </div>

            <p className="text-slate-900 font-black text-sm tracking-widest uppercase flex flex-col md:flex-row items-center gap-2">
              Made with love by <span className="text-indigo-600">Team BITNOX</span>
            </p>

            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              © 2026 GitLexia. All systems nominal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ArchitectureCard = ({ step, index }: { step: ProjectStep, index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all overflow-hidden h-full flex flex-col"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
      <span className="text-4xl font-black text-white">{index + 1}</span>
    </div>

    <div className="size-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
      {index === 0 && <Database className="size-6" />}
      {index === 1 && <Terminal className="size-6" />}
      {index === 2 && <Cpu className="size-6" />}
      {index === 3 && <Layers className="size-6" />}
      {index === 4 && <LayoutDashboard className="size-6" />}
    </div>

    <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-300 transition-colors">
      {step.title}
    </h3>

    <p className="text-slate-400 text-sm leading-relaxed font-medium">
      {step.description}
    </p>


  </motion.div>
);

export default GitLexiaLanding;
