"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ArrowUpRight } from "lucide-react"

export interface ProjectStep {
  title: string
  description: string
  year: string
  link: string
  image: string
}

interface ProjectShowcaseProps {
  steps: ProjectStep[];
  label: string;
}

export function ProjectShowcase({ steps, label }: ProjectShowcaseProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [smoothPosition, setSmoothPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const animate = () => {
      setSmoothPosition((prev) => ({
        x: lerp(prev.x, mousePosition.x, 0.15),
        y: lerp(prev.y, mousePosition.y, 0.15),
      }))
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mousePosition])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setHoveredIndex(null)
    setIsVisible(false)
  }

  return (
    <section ref={containerRef} onMouseMove={handleMouseMove} className="relative w-full max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-muted-foreground text-xs font-bold tracking-[0.2em] uppercase mb-10 opacity-50">{label}</h2>

      <div
        className="pointer-events-none absolute z-50 overflow-hidden rounded-2xl shadow-2xl border border-white/10"
        style={{
          left: 0,
          top: 0,
          transform: `translate3d(${smoothPosition.x + 40}px, ${smoothPosition.y - 120}px, 0)`,
          opacity: isVisible ? 1 : 0,
          scale: isVisible ? 1 : 0.8,
          transition: "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), scale 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div className="relative w-[320px] h-[200px] bg-slate-900 rounded-2xl overflow-hidden">
          {steps.map((step, index) => (
            <img
              key={step.title}
              src={step.image || "/placeholder.svg"}
              alt={step.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out"
              style={{
                opacity: hoveredIndex === index ? 1 : 0,
                scale: hoveredIndex === index ? 1 : 1.1,
                filter: hoveredIndex === index ? "none" : "blur(20px)",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
        </div>
      </div>

      <div className="space-y-0 relative z-10">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="group block cursor-default"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="relative py-8 border-t border-slate-200/10 transition-all duration-300 ease-out">
              <div
                className={`
                  absolute inset-0 -mx-6 px-6 bg-slate-900/5 rounded-2xl
                  transition-all duration-500 ease-out
                  ${hoveredIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]"}
                `}
              />

              <div className="relative flex items-center justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-3">
                    <h3 className="text-slate-900 dark:text-white font-black text-2xl md:text-3xl tracking-tighter">
                      <span className="relative">
                        {step.title}
                        <span
                          className={`
                            absolute left-0 -bottom-1 h-1 bg-indigo-500
                            transition-all duration-500 ease-out
                            ${hoveredIndex === index ? "w-full" : "w-0"}
                          `}
                        />
                      </span>
                    </h3>


                  </div>

                  <p
                    className={`
                      text-slate-500 dark:text-slate-400 text-lg mt-3 leading-relaxed max-w-xl
                      transition-all duration-500 ease-out
                      ${hoveredIndex === index ? "text-slate-800 dark:text-slate-200" : ""}
                    `}
                  >
                    {step.description}
                  </p>
                </div>

                <span
                  className={`
                    text-sm font-black text-indigo-500/50 uppercase tracking-widest
                    transition-all duration-500 ease-out
                    ${hoveredIndex === index ? "text-indigo-600 scale-110" : ""}
                  `}
                >
                  {step.year}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="border-t border-slate-200/10" />
      </div>
    </section>
  )
}
