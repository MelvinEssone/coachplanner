import { cn, getStatutLabel } from "@/lib/utils";

type Status = "A_VENIR" | "EN_COURS" | "TERMINEE" | "EN_ATTENTE" | "SIGNE" | "ARCHIVE";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { bg: string; text: string; dot: string }> = {
  A_VENIR: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  EN_COURS: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  TERMINEE: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  EN_ATTENTE: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500" },
  SIGNE: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" },
  ARCHIVE: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.ARCHIVE;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
        config.bg,
        config.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
      {getStatutLabel(status)}
    </span>
  );
}
