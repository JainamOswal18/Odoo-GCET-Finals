import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "bordered";
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = "default", hover = false, padding = "md", children, ...props }, ref) => {
        const variants = {
            default: "card",
            glass: "glass rounded-xl",
            bordered: "bg-white border border-gray-200 rounded-xl",
        };

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    variants[variant],
                    paddings[padding],
                    hover && "card-hover",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    title,
    description,
    action,
    className,
    ...props
}) => {
    return (
        <div className={cn("flex items-start justify-between mb-4", className)} {...props}>
            <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {description && (
                    <p className="mt-1 text-sm text-gray-500">{description}</p>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};

type CardContentProps = React.HTMLAttributes<HTMLDivElement>;

export const CardContent: React.FC<CardContentProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    );
};

type CardFooterProps = React.HTMLAttributes<HTMLDivElement>;

export const CardFooter: React.FC<CardFooterProps> = ({
    className,
    children,
    ...props
}) => {
    return (
        <div
            className={cn("mt-4 pt-4 border-t border-gray-100 flex items-center gap-3", className)}
            {...props}
        >
            {children}
        </div>
    );
};
