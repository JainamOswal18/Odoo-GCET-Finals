import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format date 
export function formatDate(date: Date | string, format: "short" | "long" | "full" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const optionsMap: Record<"short" | "long" | "full", Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "short", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    full: { weekday: "long", day: "2-digit", month: "long", year: "numeric" },
  };

  return d.toLocaleDateString("en-IN", optionsMap[format]);
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Truncate text
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// Payment status helpers
export type PaymentStatus = "paid" | "partial" | "unpaid";

export function getPaymentStatus(paid: number, total: number): PaymentStatus {
  if (paid >= total) return "paid";
  if (paid > 0) return "partial";
  return "unpaid";
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return {
    paid: "Paid",
    partial: "Partially Paid",
    unpaid: "Not Paid",
  }[status];
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  return {
    paid: "badge-success",
    partial: "badge-warning",
    unpaid: "badge-error",
  }[status];
}
