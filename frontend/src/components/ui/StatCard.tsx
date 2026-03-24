import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
  green: { bg: "bg-green-50", text: "text-green-600" },
  orange: { bg: "bg-orange-50", text: "text-orange-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, color = "blue", trend, className }: StatCardProps) {
  const { bg, text } = colorMap[color] || colorMap.blue;
  return (
    <div className={cn("bg-white rounded-xl p-5 border border-gray-100", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={cn("text-xs mt-1 font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl", bg)}>
          <div className={cn("[&>svg]:w-5 [&>svg]:h-5", text)}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
