import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Menu,
    Bell,
    Search,
    LogOut,
    User,
    Settings,
    ChevronDown,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    {/* <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg w-64 lg:w-80">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400"
                        />
                        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-white rounded border border-gray-200">
                            ⌘K
                        </kbd>
                    </div> */}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    {/* <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                    </button> */}

                    {/* User Menu */}
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-medium">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                <div className="hidden lg:block text-left">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400 hidden lg:block" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                align="end"
                                sideOffset={8}
                                className={cn(
                                    "min-w-[200px] bg-white rounded-xl shadow-lg border border-gray-100 p-1.5",
                                    "animate-slideDown"
                                )}
                            >
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg outline-none cursor-pointer hover:bg-gray-50"
                                    onSelect={() => navigate("/settings/profile")}
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </DropdownMenu.Item>
                                {user?.role === "admin" && (
                                    <DropdownMenu.Item
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg outline-none cursor-pointer hover:bg-gray-50"
                                        onSelect={() => navigate("/settings")}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </DropdownMenu.Item>
                                )}
                                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                                <DropdownMenu.Item
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded-lg outline-none cursor-pointer hover:bg-red-50"
                                    onSelect={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </DropdownMenu.Item>
                            </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                    </DropdownMenu.Root>
                </div>
            </div>
        </header>
    );
};
