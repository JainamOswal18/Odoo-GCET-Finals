import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Save, Archive, TrendingUp, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { budgetsApi, analyticalAccountsApi } from "@/lib/api";
import type { Budget, AnalyticalAccount } from "@/lib/types";

const budgetSchema = z.object({
    name: z.string().min(1, "Name is required"),
    analyticalAccountId: z.string().min(1, "Analytical Account is required"),
    periodStart: z.string().min(1, "Start date is required"),
    periodEnd: z.string().min(1, "End date is required"),
    plannedAmount: z.number().min(0, "Planned amount must be positive"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export const Budgets: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("new");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [budgetsData, accountsData] = await Promise.all([
                budgetsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            console.log('Budgets fetched:', budgetsData);
            console.log('Analytical accounts fetched:', accountsData);
            setBudgets(budgetsData);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

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

    const onSubmit = async (data: BudgetFormData) => {
        try {
            setLoading(true);
            setError(null);

            if (editingId) {
                await budgetsApi.update(editingId, data);
            } else {
                await budgetsApi.create(data);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save budget');
        } finally {
            setLoading(false);
        }
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

    const handleArchive = async () => {
        if (!editingId) return;

        if (!confirm('Are you sure you want to archive this budget?')) {
            return;
        }

        try {
            setLoading(true);
            await budgetsApi.archive(editingId);
            await fetchData();
            setView('list');
            setEditingId(null);
            reset();
        } catch (err: any) {
            setError(err.message || 'Failed to archive budget');
        } finally {
            setLoading(false);
        }
    };

    // Filter budgets based on activeTab and search
    const filteredBudgets = budgets.filter((budget) => {
        // Filter by active status based on tab
        const isActive = Number(budget.active ?? 1); // Default to active if undefined
        const activeFilter = activeTab === 'archived' ? isActive === 0 : isActive === 1;

        // Filter by search term
        const searchFilter = budget.name.toLowerCase().includes(searchTerm.toLowerCase());

        return activeFilter && searchFilter;
    });

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
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Tabs for filtering */}
                    <div className="flex items-center space-x-1 mb-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'new'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'archived'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Archived
                        </button>
                    </div>

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

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading budgets...</div>
                        </div>
                    ) : filteredBudgets.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No budgets found. Click "New Budget" to create one.
                        </div>
                    ) : (
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
                                                ₹{(budget.plannedAmount || budget.budgetedAmount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                ₹{(budget.actualAmount || 0).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${(Number(budget.achievementPercentage) || 0) >= 80
                                                        ? 'bg-green-100 text-green-700'
                                                        : (Number(budget.achievementPercentage) || 0) >= 50
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {(Number(budget.achievementPercentage) || 0).toFixed(1)}%
                                                    </div>
                                                    {(Number(budget.achievementPercentage) || 0) > 100 && (
                                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 text-right font-medium ${(Number(budget.remainingBalance) || 0) < 0 ? 'text-red-600' : 'text-emerald-600'
                                                }`}>
                                                ₹{(Number(budget.remainingBalance) || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                    </Button>
                    <Button
                        variant="outline"
                        leftIcon={<Archive className="w-4 h-4" />}
                        onClick={handleArchive}
                        disabled={loading || !editingId}
                    >
                        Archive
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
                            options={analyticalAccounts.map(a => ({
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
                                        ₹{(Number(budgets.find(b => b.id === editingId)?.actualAmount) || 0).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Achievement:</span>
                                    <span className="font-medium text-indigo-600">
                                        {(Number(budgets.find(b => b.id === editingId)?.achievementPercentage) || 0).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Remaining:</span>
                                    <span className={`font-medium ${(Number(budgets.find(b => b.id === editingId)?.remainingBalance) || 0) < 0
                                        ? 'text-red-600'
                                        : 'text-emerald-600'
                                        }`}>
                                        ₹{(Number(budgets.find(b => b.id === editingId)?.remainingBalance) || 0).toLocaleString()}
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
