import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    open,
    onOpenChange,
    title,
    description,
    children,
    size = "md",
    showCloseButton = true,
}) => {
    const sizes = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        full: "max-w-4xl",
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn" />
                <DialogPrimitive.Content
                    className={cn(
                        "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                        "w-[95vw] bg-white rounded-xl shadow-xl",
                        "animate-scaleIn",
                        "focus:outline-none",
                        sizes[size]
                    )}
                >
                    <div className="flex items-start justify-between p-6 border-b border-gray-100">
                        <div>
                            <DialogPrimitive.Title className="text-lg font-semibold text-gray-900">
                                {title}
                            </DialogPrimitive.Title>
                            {description && (
                                <DialogPrimitive.Description className="mt-1 text-sm text-gray-500">
                                    {description}
                                </DialogPrimitive.Description>
                            )}
                        </div>
                        {showCloseButton && (
                            <DialogPrimitive.Close className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                                <X className="h-5 w-5" />
                            </DialogPrimitive.Close>
                        )}
                    </div>
                    <div className="p-6">{children}</div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

// Modal Footer for actions
interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
    return (
        <div
            className={cn(
                "flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100",
                className
            )}
        >
            {children}
        </div>
    );
};
