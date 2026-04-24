import type { LucideIcon } from "lucide-react";
import {
  Sparkles,
  Users,
  Target,
  HandCoins,
  HeartHandshake,
  Network,
  TrendingUp,
  Map,
  CalendarCheck,
  LineChart,
  Sun,
  ScrollText,
} from "lucide-react";

export interface Pillar {
  letter: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Tab id in the main app to navigate to (when applicable). */
  ctaTab?: string;
  /** Static label for what this pillar maps to today. */
  mappedTo: string;
  /** Whether this pillar has live progress wired up. */
  hasProgress: boolean;
}

export const PILLARS: Pillar[] = [
  { letter: "F", name: "Faith",          description: "Daily scripture & devotional",      icon: Sparkles,      mappedTo: "Faith + Finance card",   hasProgress: true },
  { letter: "A", name: "Accountability", description: "Small group check-ins",             icon: Users,          mappedTo: "Accountability groups",  hasProgress: false },
  { letter: "I", name: "Intentionality", description: "Goal-based budgeting",              icon: Target,         ctaTab: "budget",  mappedTo: "Budget tab",             hasProgress: true },
  { letter: "T", name: "Tithing",        description: "Giving tracker & tithe goals",      icon: HandCoins,      ctaTab: "budget",  mappedTo: "Giving categories",      hasProgress: true },
  { letter: "H", name: "Humility",       description: "Net worth reflection",              icon: HeartHandshake, ctaTab: "networth",mappedTo: "Net Worth tab",          hasProgress: true },
  { letter: "N", name: "Network",        description: "Connect with members",              icon: Network,        mappedTo: "Member network",         hasProgress: false },
  { letter: "A", name: "Assets",         description: "Track what you own",                icon: TrendingUp,     ctaTab: "networth",mappedTo: "Net Worth tab",          hasProgress: true },
  { letter: "N", name: "Navigation",     description: "Personal financial roadmap",        icon: Map,            mappedTo: "Preparedness recommendations", hasProgress: true },
  { letter: "C", name: "Consistency",    description: "Habits & streaks",                  icon: CalendarCheck,  mappedTo: "Habit tracker (coming soon)", hasProgress: false },
  { letter: "I", name: "Investing",      description: "Group investing portal",            icon: LineChart,      mappedTo: "Investing portal",       hasProgress: false },
  { letter: "A", name: "Abundance",      description: "Mindset lessons & reflection",      icon: Sun,            mappedTo: "Mindset (coming soon)",  hasProgress: false },
  { letter: "L", name: "Legacy",         description: "Estate planning & family readiness",icon: ScrollText,     ctaTab: "estate",  mappedTo: "Estate & Legacy tab",    hasProgress: true },
];
