import React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface SelectProps {
    options: SelectOption[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export const Select: React.FC<SelectProps> = ({
    options,
    value,
    onValueChange,
    placeholder = "Select an option",
    label,
    error,
    disabled,
    className,
}) => {
    return (
        <div className={cn("w-full", className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}
            <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
                <SelectPrimitive.Trigger
                    className={cn(
                        "flex items-center justify-between w-full px-3.5 py-2.5",
                        "bg-white border rounded-lg text-sm",
                        "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        error ? "border-red-500" : "border-gray-200 hover:border-gray-300",
                        "transition-all duration-200"
                    )}
                >
                    <SelectPrimitive.Value placeholder={placeholder} />
                    <SelectPrimitive.Icon>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>

                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        className={cn(
                            "overflow-hidden bg-white rounded-lg shadow-lg border border-gray-100",
                            "animate-slideDown z-50"
                        )}
                        position="popper"
                        sideOffset={4}
                    >
                        <SelectPrimitive.Viewport className="p-1">
                            {options.map((option) => (
                                <SelectPrimitive.Item
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={cn(
                                        "relative flex items-center px-3 py-2 text-sm rounded-md cursor-pointer",
                                        "outline-none select-none",
                                        "data-[highlighted]:bg-indigo-50 data-[highlighted]:text-indigo-600",
                                        "data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed"
                                    )}
                                >
                                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                                    <SelectPrimitive.ItemIndicator className="absolute right-2">
                                        <Check className="h-4 w-4 text-indigo-600" />
                                    </SelectPrimitive.ItemIndicator>
                                </SelectPrimitive.Item>
                            ))}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
            {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        </div>
    );
};
