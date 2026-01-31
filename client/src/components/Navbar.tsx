import { cn } from "@/lib/utils";

export function Navbar({ className }: { className?: string }) {
    return (
        <div className={cn("z-50 flex justify-center w-full transition-all duration-300 fixed top-6 left-0 right-0")}>
            <nav className={cn(
                "flex justify-between items-center px-4 md:px-8 py-3 transition-all duration-300",
                "w-[95%] md:w-[80%] rounded-full",
                "bg-white/70 backdrop-blur-xl border border-gray-200 shadow-xl",
                className
            )}>
                {/* Empty Navbar as requested */}
            </nav>
        </div>
    );
}
