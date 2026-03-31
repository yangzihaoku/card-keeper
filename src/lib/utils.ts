import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the current cycle period boundaries for a benefit
 */
export function getCycleBoundaries(
  cycleType: string,
  cycleReference: string,
  anniversaryMonth?: number,
  anniversaryDay?: number,
  now: Date = new Date()
): { start: Date; end: Date } {
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  switch (cycleType) {
    case "monthly": {
      const start = new Date(year, month, 1);
      const end = new Date(year, month + 1, 0, 23, 59, 59);
      return { start, end };
    }
    case "quarterly": {
      const qStart = Math.floor(month / 3) * 3;
      const start = new Date(year, qStart, 1);
      const end = new Date(year, qStart + 3, 0, 23, 59, 59);
      return { start, end };
    }
    case "semi_annual": {
      const half = month < 6 ? 0 : 6;
      const start = new Date(year, half, 1);
      const end = new Date(year, half + 6, 0, 23, 59, 59);
      return { start, end };
    }
    case "annual": {
      if (cycleReference === "anniversary" && anniversaryMonth) {
        const annMonth = anniversaryMonth - 1; // 0-indexed
        const annDay = anniversaryDay || 1;
        let start = new Date(year, annMonth, annDay);
        if (start > now) {
          start = new Date(year - 1, annMonth, annDay);
        }
        const end = new Date(start.getFullYear() + 1, annMonth, annDay - 1, 23, 59, 59);
        return { start, end };
      }
      const start = new Date(year, 0, 1);
      const end = new Date(year, 11, 31, 23, 59, 59);
      return { start, end };
    }
    default:
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31, 23, 59, 59) };
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  if (currency === "CNY" || currency === "RMB") {
    return `¥${amount.toLocaleString("zh-CN")}`;
  }
  return `$${amount.toLocaleString("en-US")}`;
}

/**
 * Get days remaining until a date
 */
export function daysUntil(date: Date, from: Date = new Date()): number {
  const diff = date.getTime() - from.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get urgency level based on cycle end and usage
 */
export function getUrgency(
  daysLeft: number,
  usedRatio: number
): "ok" | "warning" | "urgent" {
  if (usedRatio >= 1) return "ok"; // fully used
  if (daysLeft <= 7) return "urgent";
  if (daysLeft <= 14 || usedRatio < 0.3) return "warning";
  return "ok";
}

/**
 * Cycle type display names (Chinese)
 */
export const cycleTypeLabels: Record<string, string> = {
  monthly: "每月",
  quarterly: "每季度",
  semi_annual: "每半年",
  annual: "每年",
  one_time: "一次性",
  per_event: "每次使用",
  ongoing: "持续",
};

/**
 * Category display names and icons
 */
export const categoryLabels: Record<string, { label: string; icon: string }> = {
  credit: { label: "消费额度", icon: "CreditCard" },
  free_night: { label: "免费住宿", icon: "Moon" },
  status: { label: "会员身份", icon: "Crown" },
  lounge: { label: "贵宾厅", icon: "Armchair" },
  insurance: { label: "保险", icon: "Shield" },
  points: { label: "积分", icon: "Coins" },
  lifestyle: { label: "生活权益", icon: "Heart" },
  travel: { label: "出行", icon: "Plane" },
};
