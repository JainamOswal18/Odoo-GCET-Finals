import React from "react";
import { Outlet, Navigate, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    FileText,
    ShoppingCart,
    CreditCard,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export const PortalLayout: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect admin users to admin dashboard
    if (user?.role === "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    const navItems = [
        { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/portal" },
        { label: "My Invoices", icon: <FileText className="w-5 h-5" />, href: "/portal/invoices" },
        { label: "My Orders", icon: <ShoppingCart className="w-5 h-5" />, href: "/portal/orders" },
        { label: "Payments", icon: <CreditCard className="w-5 h-5" />, href: "/portal/payments" },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">Shiv Furniture</h1>
                                <p className="text-xs text-gray-500">Customer Portal</p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                                    {user?.name?.charAt(0) || "U"}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-1 -mb-px overflow-x-auto pb-px">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/portal"}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                        isActive
                                            ? "border-violet-500 text-violet-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                                    )
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-100 bg-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-500">
                            2026 Shiv Furniture. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <a href="#" className="hover:text-gray-700">Help</a>
                            <a href="#" className="hover:text-gray-700">Privacy</a>
                            <a href="#" className="hover:text-gray-700">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
