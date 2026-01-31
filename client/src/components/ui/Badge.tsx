import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "primary";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
    className,
    variant = "neutral",
    size = "md",
    dot = false,
    children,
    ...props
}) => {
    const variants: Record<BadgeVariant, string> = {
        success: "bg-emerald-50 text-emerald-700 border-emerald-200",
        warning: "bg-amber-50 text-amber-700 border-amber-200",
        error: "bg-red-50 text-red-700 border-red-200",
        info: "bg-blue-50 text-blue-700 border-blue-200",
        neutral: "bg-gray-100 text-gray-700 border-gray-200",
        primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
    };

    const dotColors: Record<BadgeVariant, string> = {
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        error: "bg-red-500",
        info: "bg-blue-500",
        neutral: "bg-gray-500",
        primary: "bg-indigo-500",
    };

    const sizes: Record<BadgeSize, string> = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center font-medium rounded-full border",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {dot && (
                <span
                    className={cn("w-1.5 h-1.5 rounded-full mr-1.5", dotColors[variant])}
                />
            )}
            {children}
        </span>
    );
};

// Predefined payment status badges
export const PaymentStatusBadge: React.FC<{ status: "paid" | "partial" | "unpaid" }> = ({
    status,
}) => {
    const config = {
        paid: { variant: "success" as const, label: "Paid" },
        partial: { variant: "warning" as const, label: "Partially Paid" },
        unpaid: { variant: "error" as const, label: "Not Paid" },
    };

    const { variant, label } = config[status];

    return (
        <Badge variant={variant} dot>
            {label}
        </Badge>
    );
};

// Order status badges
export const OrderStatusBadge: React.FC<{ status: "draft" | "confirmed" | "done" | "cancelled" }> = ({
    status,
}) => {
    const config = {
        draft: { variant: "neutral" as const, label: "Draft" },
        confirmed: { variant: "info" as const, label: "Confirmed" },
        done: { variant: "success" as const, label: "Done" },
        cancelled: { variant: "error" as const, label: "Cancelled" },
    };

    const { variant, label } = config[status];

    return (
        <Badge variant={variant} dot>
            {label}
        </Badge>
    );
};
