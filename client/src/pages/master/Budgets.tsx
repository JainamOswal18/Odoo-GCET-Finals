import React, { useState } from "react";
import { Plus, Search, Filter, Save, Archive, TrendingUp, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { MOCK_ANALYTICAL_ACCOUNTS } from "@/lib/mock";
import type { Budget } from "@/lib/types";

const budgetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    analyticalAccountId: z.string().min(1, "Analytical Account is required"),
    periodStart: z.string().min(1, "Start date is required"),
    periodEnd: z.string().min(1, "End date is required"),
    plannedAmount: z.number().min(0, "Planned amount must be positive"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

// Mock budget data
const MOCK_BUDGETS: Budget[] = [
    {
        id: "1",
        name: "Q1 2026 Marketing Budget",
        analyticalAccountId: "1",
        analyticalAccountName: "Furniture Expo 2026",
        periodStart: "2026-01-01",
        periodEnd: "2026-03-31",
        plannedAmount: 500000,
        actualAmount: 325000,
        achievementPercentage: 65,
        remainingBalance: 175000,
        revisions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: "2",
        name: "Festival Season Budget",
        analyticalAccountId: "2",
        analyticalAccountName: "Deepawali Sale",
        periodStart: "2026-10-01",
        periodEnd: "2026-11-30",
        plannedAmount: 800000,
        actualAmount: 120000,
        achievementPercentage: 15,
        remainingBalance: 680000,
        revisions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export const Budgets: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("confirm");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BudgetFormData>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            plannedAmount: 0,
        },
    });

    const onSubmit = (data: BudgetFormData) => {
        const selectedAccount = MOCK_ANALYTICAL_ACCOUNTS.find(a => a.id === data.analyticalAccountId);

        if (editingId) {
            setBudgets((prev) =>
                prev.map((b) =>
                    b.id === editingId
                        ? {
                            ...b,
                            ...data,
                            analyticalAccountName: selectedAccount?.name,
                            // Recalculate metrics
                            achievementPercentage: (b.actualAmount / data.plannedAmount) * 100,
                            remainingBalance: data.plannedAmount - b.actualAmount,
                            updatedAt: new Date().toISOString()
                        }
                        : b
                )
            );
        } else {
            const newBudget: Budget = {
                id: crypto.randomUUID(),
                ...data,
                analyticalAccountName: selectedAccount?.name,
                actualAmount: 0,
                achievementPercentage: 0,
                remainingBalance: data.plannedAmount,
                revisions: [],
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setBudgets((prev) => [...prev, newBudget]);
        }
        setView("list");
        reset();
        setEditingId(null);
    };

    const handleEdit = (budget: Budget) => {
        setEditingId(budget.id);
        reset({
            name: budget.name,
            analyticalAccountId: budget.analyticalAccountId,
            periodStart: budget.periodStart,
            periodEnd: budget.periodEnd,
            plannedAmount: budget.plannedAmount,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ plannedAmount: 0 });
        setView("form");
    };

    const filteredBudgets = budgets.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget Master</h1>
                        <p className="text-gray-500">Manage budgets and track performance</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Budget
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search budgets..."
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                            Filters
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Budget Name</th>
                                    <th className="px-4 py-3">Analytical Account</th>
                                    <th className="px-4 py-3">Period</th>
                                    <th className="px-4 py-3 text-right">Planned</th>
                                    <th className="px-4 py-3 text-right">Actual</th>
                                    <th className="px-4 py-3 text-right">Achievement</th>
                                    <th className="px-4 py-3 text-right rounded-tr-lg">Remaining</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBudgets.map((budget) => (
                                    <tr
                                        key={budget.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(budget)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {budget.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs">
                                                {budget.analyticalAccountName || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {new Date(budget.periodStart).toLocaleDateString()} - {new Date(budget.periodEnd).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                            ₹{budget.plannedAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            ₹{budget.actualAmount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className={`px-2 py-1 rounded-full text-xs font-medium ${budget.achievementPercentage >= 80
                                                        ? 'bg-green-100 text-green-700'
                                                        : budget.achievementPercentage >= 50
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {budget.achievementPercentage.toFixed(1)}%
                                                </div>
                                                {budget.achievementPercentage > 100 && (
                                                    <AlertCircle className="w-4 h-4 text-red-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-4 py-3 text-right font-medium ${budget.remainingBalance < 0 ? 'text-red-600' : 'text-emerald-600'
                                            }`}>
                                            ₹{budget.remainingBalance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold text-gray-900">Budget Master</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setView('list')}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => setView('list')}>Back</Button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center space-x-1 px-4 py-2 bg-gray-50">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        New
                    </button>
                    <button
                        onClick={() => setActiveTab('confirm')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'confirm' ? 'bg-pink-100 text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Confirm
                    </button>
                    <button
                        onClick={() => setActiveTab('archived')}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === 'archived' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Archived
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end p-4 space-x-2">
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        leftIcon={<Save className="w-4 h-4" />}
                    >
                        Confirm
                    </Button>
                    <Button variant="outline" leftIcon={<Archive className="w-4 h-4" />}>
                        Archived
                    </Button>
                </div>
            </div>

            <Card className="p-8">
                <div className="mb-8">
                    <Input
                        placeholder="e.g. Q1 2026 Marketing Budget"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-2 focus:ring-0 focus:border-indigo-600"
                        label="Budget Name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Select
                            label="Analytical Account"
                            options={MOCK_ANALYTICAL_ACCOUNTS.map(a => ({
                                value: a.id,
                                label: `${a.code} - ${a.name}`
                            }))}
                            value={watch("analyticalAccountId")}
                            onValueChange={(val) => setValue("analyticalAccountId", val)}
                            error={errors.analyticalAccountId?.message}
                        />

                        <Input
                            label="Planned Amount (₹)"
                            type="number"
                            placeholder="0.00"
                            error={errors.plannedAmount?.message}
                            {...register("plannedAmount", { valueAsNumber: true })}
                        />
                    </div>

                    <div className="space-y-6 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Budget Period
                        </h3>

                        <Input
                            label="Period Start"
                            type="date"
                            error={errors.periodStart?.message}
                            {...register("periodStart")}
                        />

                        <Input
                            label="Period End"
                            type="date"
                            error={errors.periodEnd?.message}
                            {...register("periodEnd")}
                        />

                        {editingId && (
                            <div className="pt-4 border-t border-indigo-200 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Actual Amount:</span>
                                    <span className="font-medium text-gray-900">
                                        ₹{budgets.find(b => b.id === editingId)?.actualAmount.toLocaleString() || 0}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Achievement:</span>
                                    <span className="font-medium text-indigo-600">
                                        {budgets.find(b => b.id === editingId)?.achievementPercentage.toFixed(1) || 0}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Remaining:</span>
                                    <span className={`font-medium ${(budgets.find(b => b.id === editingId)?.remainingBalance || 0) < 0
                                            ? 'text-red-600'
                                            : 'text-emerald-600'
                                        }`}>
                                        ₹{budgets.find(b => b.id === editingId)?.remainingBalance.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
