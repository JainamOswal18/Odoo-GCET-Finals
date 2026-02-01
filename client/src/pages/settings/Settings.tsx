import React, { useState, useEffect } from "react";
import {
    Settings as SettingsIcon,
    User,
    Shield,
    Users,
    Key,
    Database,
    Receipt,
    BarChart3,
    Check,
    X,
    Edit2,
    Save,
    Mail,
    Calendar,
    Building,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input } from "@/components/ui";

// Permission categories for the system
const permissionCategories = [
    {
        name: "Master Data",
        icon: <Database className="w-5 h-5" />,
        permissions: [
            { key: "contacts", label: "Contacts", description: "Manage customer and vendor contacts" },
            { key: "products", label: "Products", description: "Manage product catalog" },
            { key: "analyticalAccounts", label: "Analytical Accounts", description: "Manage cost centers" },
            { key: "budgets", label: "Budgets", description: "Create and manage budgets" },
            { key: "autoAnalyticalModels", label: "Auto Analytical Models", description: "Configure automatic cost center linking" },
        ],
    },
    {
        name: "Transactions",
        icon: <Receipt className="w-5 h-5" />,
        permissions: [
            { key: "purchaseOrders", label: "Purchase Orders", description: "Create and manage purchase orders" },
            { key: "vendorBills", label: "Vendor Bills", description: "Record and manage vendor bills" },
            { key: "salesOrders", label: "Sales Orders", description: "Create and manage sales orders" },
            { key: "customerInvoices", label: "Customer Invoices", description: "Generate and manage invoices" },
            { key: "payments", label: "Payments", description: "Record and reconcile payments" },
        ],
    },
    {
        name: "Budget Monitoring",
        icon: <BarChart3 className="w-5 h-5" />,
        permissions: [
            { key: "budgetOverview", label: "Budget Overview", description: "View budget utilization dashboard" },
            { key: "budgetVsActuals", label: "Budget vs Actuals", description: "Compare planned vs actual spending" },
            { key: "revisionHistory", label: "Revision History", description: "Track budget revisions" },
        ],
    },
    {
        name: "Portal Access",
        icon: <Users className="w-5 h-5" />,
        permissions: [
            { key: "viewInvoices", label: "View Invoices/Bills", description: "Portal users can view their documents" },
            { key: "downloadDocuments", label: "Download Documents", description: "Portal users can download PDFs" },
            { key: "onlinePayment", label: "Online Payment", description: "Portal users can pay invoices online" },
        ],
    },
];

// Role permissions matrix
const rolePermissions: Record<string, Record<string, { read: boolean; write: boolean; archive: boolean }>> = {
    admin: {
        // Master Data
        contacts: { read: true, write: true, archive: true },
        products: { read: true, write: true, archive: true },
        analyticalAccounts: { read: true, write: true, archive: true },
        budgets: { read: true, write: true, archive: true },
        autoAnalyticalModels: { read: true, write: true, archive: true },
        // Transactions
        purchaseOrders: { read: true, write: true, archive: true },
        vendorBills: { read: true, write: true, archive: true },
        salesOrders: { read: true, write: true, archive: true },
        customerInvoices: { read: true, write: true, archive: true },
        payments: { read: true, write: true, archive: true },
        // Budget Monitoring
        budgetOverview: { read: true, write: false, archive: false },
        budgetVsActuals: { read: true, write: false, archive: false },
        revisionHistory: { read: true, write: false, archive: false },
        // Portal Access
        viewInvoices: { read: true, write: false, archive: false },
        downloadDocuments: { read: true, write: false, archive: false },
        onlinePayment: { read: true, write: false, archive: false },
    },
    portal: {
        // Master Data - No access
        contacts: { read: false, write: false, archive: false },
        products: { read: false, write: false, archive: false },
        analyticalAccounts: { read: false, write: false, archive: false },
        budgets: { read: false, write: false, archive: false },
        autoAnalyticalModels: { read: false, write: false, archive: false },
        // Transactions - No access
        purchaseOrders: { read: false, write: false, archive: false },
        vendorBills: { read: false, write: false, archive: false },
        salesOrders: { read: false, write: false, archive: false },
        customerInvoices: { read: false, write: false, archive: false },
        payments: { read: false, write: false, archive: false },
        // Budget Monitoring - No access
        budgetOverview: { read: false, write: false, archive: false },
        budgetVsActuals: { read: false, write: false, archive: false },
        revisionHistory: { read: false, write: false, archive: false },
        // Portal Access - Own data only
        viewInvoices: { read: true, write: false, archive: false },
        downloadDocuments: { read: true, write: false, archive: false },
        onlinePayment: { read: true, write: true, archive: false },
    },
};

export const Settings: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "permissions" | "system">("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        loginId: user?.loginId || "",
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name,
                email: user.email,
                loginId: user.loginId,
            });
        }
    }, [user]);

    const handleSaveProfile = () => {
        // TODO: Implement profile update API call
        setIsEditing(false);
    };

    const tabs = [
        { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
        { id: "permissions", label: "Permissions", icon: <Shield className="w-4 h-4" /> },
        { id: "system", label: "System Info", icon: <SettingsIcon className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your account and system preferences</p>
                </div>
            </div>

            {/* Main Content with Border */}
            <div className="bg-white rounded-xl border-2 border-gray-900 overflow-hidden">
                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "text-gray-900 border-b-2 border-gray-900 bg-gray-100"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === "profile" && (
                        <div className="space-y-6">
                            {/* User Profile Card */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Profile Overview */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gray-900 rounded-xl p-6 text-white border-2 border-gray-900">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
                                                <span className="text-4xl font-bold">
                                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                                </span>
                                            </div>
                                            <h2 className="text-xl font-bold">{user?.name}</h2>
                                            <p className="text-gray-300 text-sm">{user?.email}</p>
                                            <span className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${
                                                user?.role === "admin" 
                                                    ? "bg-white text-gray-900" 
                                                    : "bg-gray-700 text-white"
                                            }`}>
                                                {user?.role === "admin" ? "Administrator" : "Portal User"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                                <Calendar className="w-4 h-4" />
                                                Member Since
                                            </div>
                                            <p className="font-semibold text-gray-900">
                                                {user?.createdAt 
                                                    ? new Date(user.createdAt).toLocaleDateString('en-GB', { 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })
                                                    : "Jan 2026"
                                                }
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                                                <Key className="w-4 h-4" />
                                                Login ID
                                            </div>
                                            <p className="font-semibold text-gray-900">{user?.loginId}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Details */}
                                <div className="lg:col-span-2">
                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                                            {!isEditing ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsEditing(true)}
                                                    leftIcon={<Edit2 className="w-4 h-4" />}
                                                >
                                                    Edit
                                                </Button>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setIsEditing(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSaveProfile}
                                                        leftIcon={<Save className="w-4 h-4" />}
                                                    >
                                                        Save
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    <User className="w-4 h-4 inline mr-2" />
                                                    Full Name
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        value={profileData.name}
                                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-medium bg-white rounded-lg px-4 py-3 border border-gray-200">
                                                        {user?.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    <Mail className="w-4 h-4 inline mr-2" />
                                                    Email Address
                                                </label>
                                                {isEditing ? (
                                                    <Input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    />
                                                ) : (
                                                    <p className="text-gray-900 font-medium bg-white rounded-lg px-4 py-3 border border-gray-200">
                                                        {user?.email}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    <Key className="w-4 h-4 inline mr-2" />
                                                    Login ID
                                                </label>
                                                <p className="text-gray-900 font-medium bg-white rounded-lg px-4 py-3 border border-gray-200">
                                                    {user?.loginId}
                                                    <span className="text-xs text-gray-400 ml-2">(cannot be changed)</span>
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                                    <Shield className="w-4 h-4 inline mr-2" />
                                                    Role
                                                </label>
                                                <p className="text-gray-900 font-medium bg-white rounded-lg px-4 py-3 border border-gray-200">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        user?.role === "admin" 
                                                            ? "bg-gray-900 text-white" 
                                                            : "bg-gray-200 text-gray-800"
                                                    }`}>
                                                        {user?.role === "admin" ? "Admin (Business Owner)" : "Portal User (Customer)"}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Role Description */}
                                        <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                                            <h4 className="font-medium text-gray-900 mb-2">Role Description</h4>
                                            {user?.role === "admin" ? (
                                                <p className="text-sm text-gray-700">
                                                    As an <strong>Admin (Business Owner)</strong>, you have full access to:
                                                    read, write, modify, and archive all master data; record transactions; 
                                                    configure auto analytical models; and view all budget reports and analytics.
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-700">
                                                    As a <strong>Portal User (Customer)</strong>, you can view, download, 
                                                    and pay your own invoices/bills via the customer portal. You have access 
                                                    to your purchase orders and sales orders.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "permissions" && (
                        <div className="space-y-6">
                            {/* Permissions Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Access Permissions</h3>
                                    <p className="text-sm text-gray-500">
                                        Your current permissions based on your role: 
                                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                                            user?.role === "admin" 
                                                ? "bg-gray-900 text-white" 
                                                : "bg-gray-200 text-gray-800"
                                        }`}>
                                            {user?.role === "admin" ? "Administrator" : "Portal User"}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Permission Matrix */}
                            <div className="space-y-6">
                                {permissionCategories.map((category) => (
                                    <div key={category.name} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                                        {/* Category Header */}
                                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-100 border-b border-gray-200">
                                            <div className="p-2 bg-white rounded-lg text-gray-900 border border-gray-300">
                                                {category.icon}
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                        </div>

                                        {/* Permissions Table */}
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-gray-200">
                                                        <th className="text-left px-6 py-3 text-sm font-medium text-gray-600">Feature</th>
                                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-24">Read</th>
                                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-24">Write</th>
                                                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 w-24">Archive</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {category.permissions.map((permission, idx) => {
                                                        const perms = rolePermissions[user?.role || "portal"][permission.key];
                                                        return (
                                                            <tr 
                                                                key={permission.key}
                                                                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{permission.label}</p>
                                                                        <p className="text-xs text-gray-500">{permission.description}</p>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center px-4 py-4">
                                                                    {perms?.read ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="text-center px-4 py-4">
                                                                    {perms?.write ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="text-center px-4 py-4">
                                                                    {perms?.archive ? (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100">
                                                                            <Check className="w-4 h-4 text-green-600" />
                                                                        </span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100">
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-6 p-4 bg-gray-100 rounded-lg">
                                <span className="text-sm text-gray-600 font-medium">Legend:</span>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100">
                                        <Check className="w-3 h-3 text-green-600" />
                                    </span>
                                    <span className="text-sm text-gray-600">Has Access</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100">
                                        <X className="w-3 h-3 text-red-600" />
                                    </span>
                                    <span className="text-sm text-gray-600">No Access</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "system" && (
                        <div className="space-y-6">
                            {/* System Info Header */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
                                <p className="text-sm text-gray-500">Budget Accounting System details and scope</p>
                            </div>

                            {/* System Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Company Info */}
                                <div className="bg-gray-900 rounded-xl p-6 text-white border-2 border-gray-900">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Building className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-semibold text-lg">Company</h4>
                                    </div>
                                    <p className="text-2xl font-bold mb-1">Shiv Furniture</p>
                                    <p className="text-gray-300 text-sm">Budget Accounting System</p>
                                </div>

                                {/* Version Info */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gray-200 rounded-lg text-gray-900">
                                            <SettingsIcon className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900">Version</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">v1.0.0</p>
                                    <p className="text-gray-500 text-sm">GCET Hackathon 2026</p>
                                </div>

                                {/* Database Info */}
                                <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gray-200 rounded-lg text-gray-900">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <h4 className="font-semibold text-gray-900">Database</h4>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mb-1">SQLite</p>
                                    <p className="text-gray-500 text-sm">Local file database</p>
                                </div>
                            </div>

                            {/* System Scope */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">System Scope</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-900 mb-2">
                                            <Database className="w-5 h-5" />
                                            <span className="font-medium">Master Data</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Contacts</li>
                                            <li>• Products</li>
                                            <li>• Analytical Accounts</li>
                                            <li>• Budgets</li>
                                            <li>• Auto Analytical Models</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-900 mb-2">
                                            <Receipt className="w-5 h-5" />
                                            <span className="font-medium">Transactions</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Purchase Orders</li>
                                            <li>• Vendor Bills</li>
                                            <li>• Sales Orders</li>
                                            <li>• Customer Invoices</li>
                                            <li>• Payments</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-900 mb-2">
                                            <BarChart3 className="w-5 h-5" />
                                            <span className="font-medium">Budget Monitoring</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Budget vs Actuals</li>
                                            <li>• Achievement %</li>
                                            <li>• Remaining Balance</li>
                                            <li>• Revision Tracking</li>
                                            <li>• Charts & Reports</li>
                                        </ul>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 text-gray-900 mb-2">
                                            <Users className="w-5 h-5" />
                                            <span className="font-medium">Customer Portal</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• View Invoices/Bills</li>
                                            <li>• View SO/PO</li>
                                            <li>• Download Documents</li>
                                            <li>• Online Payment</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* User Roles */}
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">User Roles</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-gray-900 rounded-lg p-5 border-2 border-gray-900 text-white">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                <Shield className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-white">Admin (Business Owner)</h5>
                                                <p className="text-xs text-gray-300">Full System Access</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300">
                                            Read, write, modify, and archive all master data; record transactions; 
                                            configure auto analytical models; view all budget reports and analytics.
                                        </p>
                                    </div>

                                    <div className="bg-white rounded-lg p-5 border-2 border-gray-300">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-gray-200 rounded-lg">
                                                <User className="w-6 h-6 text-gray-900" />
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-900">Contact (Portal User)</h5>
                                                <p className="text-xs text-gray-500">Limited Portal Access</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            View, download, and pay own invoices/bills via the customer portal. 
                                            Access to view purchase orders and sales orders related to their account.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
