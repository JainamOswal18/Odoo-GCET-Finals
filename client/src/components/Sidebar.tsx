import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    Package,
    Wallet,
    Receipt,
    ShoppingCart,
    FileText,
    CreditCard,
    BarChart3,
    PieChart,
    Settings,
    UserPlus,
    ChevronDown,
    ChevronRight,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    label: string;
    icon: React.ReactNode;
    href?: string;
    children?: NavItem[];
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    {
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
        href: "/dashboard",
    },
    {
        label: "Master Data",
        icon: <Settings className="w-5 h-5" />,
        adminOnly: true,
        children: [
            { label: "Contacts", icon: <Users className="w-4 h-4" />, href: "/master/contacts" },
            { label: "Products", icon: <Package className="w-4 h-4" />, href: "/master/products" },
            { label: "Analytical Accounts", icon: <Wallet className="w-4 h-4" />, href: "/master/analytical-accounts" },
            { label: "Budgets", icon: <PieChart className="w-4 h-4" />, href: "/master/budgets" },
            { label: "Auto Analytical Models", icon: <Settings className="w-4 h-4" />, href: "/master/auto-analytical" },
        ],
    },
    {
        label: "Transactions",
        icon: <Receipt className="w-5 h-5" />,
        adminOnly: true,
        children: [
            { label: "Purchase Orders", icon: <ShoppingCart className="w-4 h-4" />, href: "/transactions/purchase-orders" },
            { label: "Vendor Bills", icon: <FileText className="w-4 h-4" />, href: "/transactions/vendor-bills" },
            { label: "Sales Orders", icon: <ShoppingCart className="w-4 h-4" />, href: "/transactions/sales-orders" },
            { label: "Customer Invoices", icon: <FileText className="w-4 h-4" />, href: "/transactions/customer-invoices" },
            { label: "Payments", icon: <CreditCard className="w-4 h-4" />, href: "/transactions/payments" },
        ],
    },
    {
        label: "Budget Monitoring",
        icon: <BarChart3 className="w-5 h-5" />,
        adminOnly: true,
        children: [
            { label: "Overview", icon: <PieChart className="w-4 h-4" />, href: "/budget-monitoring/overview" },
            { label: "Budget vs Actuals", icon: <BarChart3 className="w-4 h-4" />, href: "/budget-monitoring/budget-vs-actuals" },
            { label: "Revision History", icon: <FileText className="w-4 h-4" />, href: "/budget-monitoring/revision-history" },
        ],
    },
    {
        label: "Settings",
        icon: <Settings className="w-5 h-5" />,
        adminOnly: true,
        children: [
            { label: "Create User", icon: <UserPlus className="w-4 h-4" />, href: "/create-user" },
        ],
    },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [expandedItems, setExpandedItems] = useState<string[]>(["Master Data", "Transactions"]);

    const toggleExpand = (label: string) => {
        setExpandedItems((prev) =>
            prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
        );
    };

    const filteredNavItems = navItems.filter((item) => {
        if (item.adminOnly && user?.role !== "admin") return false;
        return true;
    });

    return (
        <>
            {/* Overlay for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">S</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-sm">Shiv Furniture</h1>
                            <p className="text-xs text-gray-500">Budget ERP</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {filteredNavItems.map((item) => (
                        <div key={item.label}>
                            {item.children ? (
                                /* Expandable Item */
                                <div>
                                    <button
                                        onClick={() => toggleExpand(item.label)}
                                        className={cn(
                                            "sidebar-item w-full justify-between",
                                            expandedItems.includes(item.label) && "bg-gray-50"
                                        )}
                                    >
                                        <span className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </span>
                                        {expandedItems.includes(item.label) ? (
                                            <ChevronDown className="w-4 h-4" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4" />
                                        )}
                                    </button>
                                    <AnimatePresence>
                                        {expandedItems.includes(item.label) && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 py-1">
                                                    {item.children.map((child) => (
                                                        <NavLink
                                                            key={child.href}
                                                            to={child.href!}
                                                            onClick={onClose}
                                                            className={({ isActive }) =>
                                                                cn(
                                                                    "sidebar-item text-sm",
                                                                    isActive && "active"
                                                                )
                                                            }
                                                        >
                                                            {child.icon}
                                                            <span>{child.label}</span>
                                                        </NavLink>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                /* Simple Link */
                                <NavLink
                                    to={item.href!}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn("sidebar-item", isActive && "active")
                                    }
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </NavLink>
                            )}
                        </div>
                    ))}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-medium">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};
