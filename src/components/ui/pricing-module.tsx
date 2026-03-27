"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  priceMonthly: number;
  priceYearly: number;
  users: string;
  features: PlanFeature[];
  recommended?: boolean;
}

export interface PricingModuleProps {
  title?: string;
  subtitle?: string;
  annualBillingLabel?: string;
  buttonLabel?: string;
  plans: PricingPlan[];
  defaultAnnual?: boolean;
  className?: string;
  onPlanClick?: (plan: PricingPlan, isAnnual: boolean) => void;
  loadingId?: string | null;
}

export function PricingModule({
  title = "Pricing Plans",
  subtitle = "Choose a plan that fits your needs.",
  annualBillingLabel = "Annual billing",
  buttonLabel = "Get started",
  plans,
  defaultAnnual = false,
  className,
  onPlanClick,
  loadingId
}: PricingModuleProps) {
  const [isAnnual, setIsAnnual] = React.useState(defaultAnnual);

  return (
    <section
      className={cn(
        "w-full bg-background text-foreground py-20 px-4 md:px-8",
        className
      )}
    >
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-2 uppercase" style={{ fontFamily: 'sup' }}>{title}</h2>
        <p className="text-muted-foreground mb-8">{subtitle}</p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <Switch
            id="billing-toggle"
            isSelected={isAnnual}
            onChange={(checked) => setIsAnnual(checked)}
          />
          <label
            htmlFor="billing-toggle"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            {annualBillingLabel}
          </label>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative border border-muted rounded-xl transition-all hover:shadow-md hover:border-primary/30",
                plan.recommended && "border-primary ring-1 ring-primary/30 scale-[1.03]"
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-0 right-0 mx-auto w-fit bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wider">
                  Recommended
                </div>
              )}

              <CardHeader className="text-center pt-8">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <CardTitle className="font-black tracking-tight" style={{ fontFamily: 'sup' }}>{plan.name}</CardTitle>
                <CardDescription className="text-xs uppercase tracking-widest font-bold text-slate-400">{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <div className="text-3xl font-black mb-2 transition-all duration-300" style={{ fontFamily: 'sup' }}>
                  ₹{isAnnual ? plan.priceYearly : plan.priceMonthly}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  / {isAnnual ? "year" : "month"}
                </p>

                <Button
                  variant={plan.recommended ? "default" : "outline"}
                  className="w-full mb-6 rounded-full"
                  onClick={() => onPlanClick?.(plan, isAnnual)}
                  disabled={loadingId === plan.id}
                >
                  {loadingId === plan.id ? "Processing..." : buttonLabel}
                </Button>

                <div className="text-left text-sm">
                  <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-2" style={{ fontFamily: 'sup' }}>Overview</h4>
                  <p className="text-slate-600 mb-4 font-medium italic">✓ {plan.users}</p>

                  <h4 className="font-black uppercase text-[10px] tracking-widest text-slate-400 mb-2" style={{ fontFamily: 'sup' }}>Highlights</h4>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        {f.included ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <X className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span
                          className={f.included
                            ? "text-slate-600 font-medium"
                            : "text-slate-400/60 line-through"}
                        >
                          {f.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
