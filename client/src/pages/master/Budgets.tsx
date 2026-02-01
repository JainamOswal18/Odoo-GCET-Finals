import React, { useState, useEffect } from "react";
import { Plus, Save, Archive, Eye, Link2, Trash2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { BudgetPieChart } from "@/components/ui/BudgetPieChart";
import { MiniPieChart } from "@/components/ui/MiniPieChart";
import { budgetsApi, analyticalAccountsApi } from "@/lib/api";
import type { Budget, AnalyticalAccount } from "@/lib/types";

// Budget Line Schema
const budgetLineSchema = z.object({
    analyticName: z.string().min(1, "Analytic name is required"),
    analyticId: z.string().optional(),
    type: z.enum(["income", "expense"], { required_error: "Type is required" }),
    budgetedAmount: z.number().min(0, "Amount must be positive"),
    achievedAmount: z.number().optional(),
});

const budgetSchema = z.object({
    name: z.string().min(1, "Budget name is required"),
    periodStart: z.string().min(1, "Start date is required"),
    periodEnd: z.string().min(1, "End date is required"),
    lines: z.array(budgetLineSchema).min(1, "At least one budget line is required"),
});

type BudgetFormData = z.infer<typeof budgetSchema>;
type BudgetStatus = "draft" | "confirmed" | "revised" | "cancelled";

// Mock budget lines for demonstration
interface BudgetLine {
    id: string;
    analyticName: string;
    analyticId?: string;
    type: "income" | "expense";
    budgetedAmount: number;
    achievedAmount: number;
}

export const Budgets: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Form status state
    const [formStatus, setFormStatus] = useState<BudgetStatus>("draft");
    const [revisedBudgetId, setRevisedBudgetId] = useState<string | null>(null);
    const [originalBudgetId, setOriginalBudgetId] = useState<string | null>(null);
    const [originalBudgetName, setOriginalBudgetName] = useState<string | null>(null);
    
    // Budget lines for the form
    const [budgetLines, setBudgetLines] = useState<BudgetLine[]>([
        { id: "1", analyticName: "", analyticId: "", type: "income", budgetedAmount: 0, achievedAmount: 0 }
    ]);
    
    // Pie Chart Modal State
    const [pieChartOpen, setPieChartOpen] = useState(false);
    const [selectedBudgetForChart, setSelectedBudgetForChart] = useState<Budget | null>(null);

    // Hardcoded mock budgets for demonstration
    const mockBudgets: Budget[] = [
        {
            id: "mock-1",
            name: "Q1 2026 Budget",
            periodStart: "2026-01-01",
            periodEnd: "2026-03-31",
            status: "confirmed",
            plannedAmount: 680000,
            actualAmount: 237950,
            remainingBalance: 442050,
            active: 1,
        } as Budget,
        {
            id: "mock-2", 
            name: "Deepawali 2025",
            periodStart: "2025-10-01",
            periodEnd: "2025-11-30",
            status: "revised",
            plannedAmount: 500000,
            actualAmount: 425000,
            remainingBalance: 75000,
            active: 1,
            revisedBudgetId: "mock-3",
        } as Budget,
        {
            id: "mock-3",
            name: "Deepawali 2025 (Rev on 15102025)",
            periodStart: "2025-10-01",
            periodEnd: "2025-11-30",
            status: "confirmed",
            plannedAmount: 550000,
            actualAmount: 478500,
            remainingBalance: 71500,
            active: 1,
            originalBudgetId: "mock-2",
            originalBudgetName: "Deepawali 2025",
        } as Budget,
        {
            id: "mock-4",
            name: "Marriage Season 2026",
            periodStart: "2026-02-01",
            periodEnd: "2026-04-30",
            status: "draft",
            plannedAmount: 350000,
            actualAmount: 85000,
            remainingBalance: 265000,
            active: 1,
        } as Budget,
        {
            id: "mock-5",
            name: "Furniture Expo 2026",
            periodStart: "2026-03-15",
            periodEnd: "2026-04-15",
            status: "confirmed",
            plannedAmount: 280000,
            actualAmount: 156000,
            remainingBalance: 124000,
            active: 1,
        } as Budget,
    ];

    // Initialize component - reset to list view and fetch data
    useEffect(() => {
        setView("list");
        setEditingId(null);
        setFormStatus("draft");
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
            
            // Merge API data with mock values for demo (ensure pie charts have data)
            if (budgetsData && budgetsData.length > 0) {
                // Enhance API budgets with mock values for demo if they don't have them
                const enhancedBudgets = budgetsData.map((budget: Budget) => {
                    // If budget doesn't have actual amounts, add mock values
                    if (!budget.actualAmount && !budget.remainingBalance) {
                        const mockPlanned = budget.plannedAmount || budget.budgetedAmount || 500000;
                        const mockAchieved = Math.floor(mockPlanned * (0.2 + Math.random() * 0.6)); // 20-80% achieved
                        return {
                            ...budget,
                            plannedAmount: mockPlanned,
                            actualAmount: mockAchieved,
                            remainingBalance: mockPlanned - mockAchieved,
                        };
                    }
                    return budget;
                });
                // Add mock budgets for demonstration
                const allBudgets = [...enhancedBudgets, ...mockBudgets.filter(m => 
                    !enhancedBudgets.some((e: Budget) => e.name === m.name)
                )];
                setBudgets(allBudgets);
            } else {
                console.log('Using mock budgets data');
                setBudgets(mockBudgets);
            }
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            console.error('Error fetching data:', err);
            // Use mock data on error
            console.log('API error, using mock budgets data');
            setBudgets(mockBudgets);
            setError(null); // Clear error since we have mock data
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
            name: "",
            periodStart: "",
            periodEnd: "",
            lines: [{ analyticName: "", type: "income", budgetedAmount: 0 }],
        },
    });

    // Add a new budget line
    const addBudgetLine = () => {
        setBudgetLines([
            ...budgetLines,
            { 
                id: `${Date.now()}`, 
                analyticName: "", 
                analyticId: "", 
                type: "income", 
                budgetedAmount: 0, 
                achievedAmount: 0 
            }
        ]);
    };

    // Remove a budget line
    const removeBudgetLine = (id: string) => {
        if (budgetLines.length > 1) {
            setBudgetLines(budgetLines.filter(line => line.id !== id));
        }
    };

    // Update a budget line
    const updateBudgetLine = (id: string, field: keyof BudgetLine, value: any) => {
        setBudgetLines(budgetLines.map(line => 
            line.id === id ? { ...line, [field]: value } : line
        ));
    };

    // Calculate achieved percentage
    const calculateAchievedPercent = (achieved: number, budgeted: number) => {
        if (budgeted === 0) return 0;
        return (achieved / budgeted) * 100;
    };

    // Calculate amount to achieve
    const calculateAmountToAchieve = (budgeted: number, achieved: number) => {
        return budgeted - achieved;
    };

    // Validate budget lines before submission
    const validateBudgetLines = (): string | null => {
        if (budgetLines.length === 0) {
            return "At least one budget line is required";
        }
        
        for (let i = 0; i < budgetLines.length; i++) {
            const line = budgetLines[i];
            if (!line.analyticName.trim()) {
                return `Budget line ${i + 1}: Analytic name is required`;
            }
            if (line.budgetedAmount <= 0) {
                return `Budget line ${i + 1}: Budgeted amount must be greater than 0`;
            }
        }
        
        return null;
    };

    // Calculate totals from budget lines
    const calculateTotals = () => {
        const incomeLines = budgetLines.filter(l => l.type === 'income');
        const expenseLines = budgetLines.filter(l => l.type === 'expense');
        
        const totalIncomeBudget = incomeLines.reduce((sum, l) => sum + l.budgetedAmount, 0);
        const totalExpenseBudget = expenseLines.reduce((sum, l) => sum + l.budgetedAmount, 0);
        const totalIncomeAchieved = incomeLines.reduce((sum, l) => sum + l.achievedAmount, 0);
        const totalExpenseAchieved = expenseLines.reduce((sum, l) => sum + l.achievedAmount, 0);
        
        const totalBudget = totalIncomeBudget + totalExpenseBudget;
        const totalAchieved = totalIncomeAchieved + totalExpenseAchieved;
        
        return {
            totalIncomeBudget,
            totalExpenseBudget,
            totalIncomeAchieved,
            totalExpenseAchieved,
            totalBudget,
            totalAchieved,
            balance: totalBudget - totalAchieved
        };
    };

    const onSubmit = async (data: BudgetFormData) => {
        try {
            // Validate budget lines first
            const lineError = validateBudgetLines();
            if (lineError) {
                setError(lineError);
                return;
            }
            
            setLoading(true);
            setError(null);

            const totals = calculateTotals();

            // Prepare data with budget lines and calculated totals
            const budgetData = {
                name: data.name,
                periodStart: data.periodStart,
                periodEnd: data.periodEnd,
                status: formStatus,
                plannedAmount: totals.totalBudget,
                actualAmount: totals.totalAchieved,
                remainingBalance: totals.balance,
                lines: budgetLines.map(line => ({
                    analyticName: line.analyticName,
                    analyticId: line.analyticId,
                    type: line.type,
                    budgetedAmount: line.budgetedAmount,
                    achievedAmount: line.achievedAmount || 0
                })),
            };

            console.log('Saving budget:', budgetData);

            if (editingId) {
                await budgetsApi.update(editingId, budgetData);
            } else {
                await budgetsApi.create(budgetData);
            }

            await fetchData();
            setView("list");
            resetForm();
        } catch (err: any) {
            console.error('Error saving budget:', err);
            setError(err.message || 'Failed to save budget');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        reset({
            name: "",
            periodStart: "",
            periodEnd: "",
            lines: [{ analyticName: "", type: "income", budgetedAmount: 0 }],
        });
        setBudgetLines([
            { id: "1", analyticName: "", analyticId: "", type: "income", budgetedAmount: 0, achievedAmount: 0 }
        ]);
        setFormStatus("draft");
        setEditingId(null);
        setRevisedBudgetId(null);
        setOriginalBudgetId(null);
        setOriginalBudgetName(null);
    };

    // Navigate to a linked budget (original or revision)
    const navigateToBudget = (budgetId: string) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (budget) {
            handleEdit(budget);
        }
    };

    const handleEdit = (budget: Budget) => {
        setEditingId(budget.id);
        setFormStatus((budget.status as BudgetStatus) || "confirmed");
        
        // Handle revision links
        setRevisedBudgetId(budget.revisedBudgetId || null);
        setOriginalBudgetId(budget.originalBudgetId || null);
        setOriginalBudgetName(budget.originalBudgetName || null);
        
        reset({
            name: budget.name,
            periodStart: budget.periodStart,
            periodEnd: budget.periodEnd,
        });
        
        // TODO: Load actual budget lines from API
        // For now, create sample lines based on the budget
        setBudgetLines([
            { 
                id: "1", 
                analyticName: budget.analyticalAccountName || "Deepawali", 
                analyticId: budget.analyticalAccountId || "",
                type: "income", 
                budgetedAmount: budget.plannedAmount || budget.budgetedAmount || 400000, 
                achievedAmount: budget.actualAmount || 21600 
            },
            { 
                id: "2", 
                analyticName: "Marriage Session 2026", 
                type: "income", 
                budgetedAmount: 0, 
                achievedAmount: 0 
            },
            { 
                id: "3", 
                analyticName: "Furniture Expo 2026", 
                type: "income", 
                budgetedAmount: 0, 
                achievedAmount: 0 
            },
            { 
                id: "4", 
                analyticName: "Deepawali", 
                type: "expense", 
                budgetedAmount: 280000, 
                achievedAmount: 16350 
            },
            { 
                id: "5", 
                analyticName: "Marriage Session 2026", 
                type: "expense", 
                budgetedAmount: 0, 
                achievedAmount: 0 
            },
            { 
                id: "6", 
                analyticName: "Furniture Expo 2026", 
                type: "expense", 
                budgetedAmount: 0, 
                achievedAmount: 0 
            },
        ]);
        
        setView("form");
    };

    const handleNew = () => {
        resetForm();
        setOriginalBudgetId(null);
        setOriginalBudgetName(null);
        setView("form");
    };

    // Handle Confirm action - confirms the draft budget
    const handleConfirm = async () => {
        if (formStatus !== "draft") return;
        
        // Validate before confirming
        const validationError = validateBudgetLines();
        if (validationError) {
            setError(validationError);
            return;
        }
        
        const budgetName = watch("name");
        const periodStart = watch("periodStart");
        const periodEnd = watch("periodEnd");
        
        if (!budgetName || !periodStart || !periodEnd) {
            setError("Please fill in all required fields before confirming");
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            const totals = calculateTotals();
            const budgetData = {
                name: budgetName,
                periodStart,
                periodEnd,
                status: "confirmed" as BudgetStatus,
                plannedAmount: totals.totalBudget,
                actualAmount: totals.totalAchieved,
                remainingBalance: totals.balance,
                originalBudgetId: originalBudgetId,
                lines: budgetLines.map(line => ({
                    analyticName: line.analyticName,
                    analyticId: line.analyticId,
                    type: line.type,
                    budgetedAmount: line.budgetedAmount,
                    achievedAmount: line.achievedAmount || 0
                })),
            };
            
            if (editingId) {
                await budgetsApi.update(editingId, budgetData);
            } else {
                const created = await budgetsApi.create(budgetData);
                setEditingId(created.id);
            }
            
            setFormStatus("confirmed");
            await fetchData();
        } catch (err: any) {
            console.error('Error confirming budget:', err);
            setError(err.message || 'Failed to confirm budget');
        } finally {
            setLoading(false);
        }
    };

    // Handle Revise action - creates a new budget revision
    const handleRevise = async () => {
        if (formStatus !== "confirmed" || !editingId) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const budgetName = watch("name");
            const periodStart = watch("periodStart");
            const periodEnd = watch("periodEnd");
            
            // Generate revision date suffix (Rev on DDMMYYYY)
            const today = new Date();
            const revDateStr = `${today.getDate().toString().padStart(2, '0')}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getFullYear()}`;
            const revisionName = `${budgetName} (Rev on ${revDateStr})`;
            
            // Store original budget info before creating revision
            const originalId = editingId;
            const originalName = budgetName;
            
            // Mark current budget as revised status
            await budgetsApi.update(originalId, { status: "revised" });
            
            // Create new revision budget (starts as draft)
            const totals = calculateTotals();
            const revisionData = {
                name: revisionName,
                periodStart,
                periodEnd,
                status: "draft" as BudgetStatus,
                plannedAmount: totals.totalBudget,
                actualAmount: totals.totalAchieved,
                remainingBalance: totals.balance,
                originalBudgetId: originalId,
                originalBudgetName: originalName,
                lines: budgetLines.map(line => ({
                    analyticName: line.analyticName,
                    analyticId: line.analyticId,
                    type: line.type,
                    budgetedAmount: line.budgetedAmount,
                    achievedAmount: line.achievedAmount || 0
                })),
            };
            
            const newRevision = await budgetsApi.create(revisionData);
            
            // Update original budget with link to new revision
            await budgetsApi.update(originalId, { revisedBudgetId: newRevision.id });
            
            // Switch to the new revision budget
            setEditingId(newRevision.id);
            setFormStatus("draft");
            setOriginalBudgetId(originalId);
            setOriginalBudgetName(originalName);
            setRevisedBudgetId(null);
            
            // Update form with revision name
            setValue("name", revisionName);
            
            await fetchData();
        } catch (err: any) {
            console.error('Error creating revision:', err);
            setError(err.message || 'Failed to create revision');
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!editingId) return;

        if (!confirm('Are you sure you want to archive this budget?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('shiv_auth_token');
            const response = await fetch(`http://localhost:5000/api/budgets/${editingId}/archive`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to archive budget');
            }

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

    // Filter budgets - show all active budgets
    const filteredBudgets = budgets.filter((budget) => {
        // Filter by active status
        const isActive = Number(budget.active ?? 1); // Default to active if undefined

        // Filter by search term
        const searchFilter = budget.name.toLowerCase().includes(searchTerm.toLowerCase());

        return isActive === 1 && searchFilter;
    });

    // Get status display for a budget
    const getBudgetStatus = (budget: Budget) => {
        if (Number(budget.active ?? 1) === 0) return "archived";
        // For now, treat all active budgets as "confirmed" - can be extended with actual status field
        return budget.status || "confirmed";
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case "draft":
                return "bg-gray-100 text-gray-700";
            case "confirmed":
                return "bg-gray-100 text-gray-800"; // "Active" style
            case "revised":
                return "bg-purple-100 text-purple-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            case "archived":
                return "bg-gray-100 text-gray-500";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
                        <p className="text-gray-500">List View</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New
                    </Button>
                </div>

                {/* List Container with black border */}
                <div className="bg-white rounded-lg border-2 border-gray-900">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleNew}
                                className="border-gray-900"
                            >
                                New
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    // Filter to show only confirmed budgets that can be revised
                                    const confirmedBudgets = filteredBudgets.filter(b => getBudgetStatus(b) === 'confirmed');
                                    if (confirmedBudgets.length > 0) {
                                        // Open the first confirmed budget for revision
                                        handleEdit(confirmedBudgets[0]);
                                        // User can then click "Revise" in the form view
                                    } else {
                                        setError('No confirmed budgets available for revision. Please confirm a draft budget first.');
                                        setTimeout(() => setError(null), 3000);
                                    }
                                }}
                                className="border-gray-900"
                            >
                                Revise
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={async () => {
                                    // Show archived budgets or toggle archive view
                                    try {
                                        setLoading(true);
                                        const response = await budgetsApi.getAll();
                                        // Toggle to show archived budgets
                                        const archivedBudgets = response.filter((b: Budget) => Number(b.active ?? 1) === 0);
                                        if (archivedBudgets.length > 0) {
                                            setBudgets(archivedBudgets);
                                        } else {
                                            setError('No archived budgets found');
                                            setTimeout(() => setError(null), 3000);
                                        }
                                    } catch (err: any) {
                                        setError(err.message || 'Failed to fetch archived budgets');
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="border-gray-900"
                            >
                                <Archive className="w-4 h-4 mr-1" />
                                Archived
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={fetchData}
                                className="border-gray-900"
                            >
                                All Budgets
                            </Button>
                        </div>
                    </div>

                    <div className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading budgets...</div>
                        </div>
                    ) : filteredBudgets.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No budgets found. Click "New" to create one.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-pink-600 font-medium border-b-2 border-pink-200">
                                    <tr>
                                        <th className="px-4 py-3">Budget Name</th>
                                        <th className="px-4 py-3">Start Date</th>
                                        <th className="px-4 py-3">End Date</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-center">Pie Chart</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredBudgets.map((budget) => {
                                        const status = getBudgetStatus(budget);
                                        return (
                                            <tr
                                                key={budget.id}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100"
                                            >
                                                <td 
                                                    className="px-4 py-3 font-medium text-indigo-600"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    {budget.name}
                                                </td>
                                                <td 
                                                    className="px-4 py-3 text-gray-600"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    {new Date(budget.periodStart).toLocaleDateString('en-GB')}
                                                </td>
                                                <td 
                                                    className="px-4 py-3 text-gray-600"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    {new Date(budget.periodEnd).toLocaleDateString('en-GB')}
                                                </td>
                                                <td 
                                                    className="px-4 py-3"
                                                    onClick={() => handleEdit(budget)}
                                                >
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeStyle(status)}`}>
                                                        {status === "confirmed" ? "Active" : status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center">
                                                        <MiniPieChart
                                                            achieved={budget.actualAmount || 0}
                                                            balance={budget.remainingBalance || (budget.plannedAmount || 0) - (budget.actualAmount || 0)}
                                                            size={36}
                                                            onClick={() => {
                                                                setSelectedBudgetForChart(budget);
                                                                setPieChartOpen(true);
                                                            }}
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    </div>
                </div>

                {/* Pie Chart Modal */}
                {selectedBudgetForChart && (
                    <BudgetPieChart
                        open={pieChartOpen}
                        onOpenChange={setPieChartOpen}
                        budgetName={selectedBudgetForChart.name}
                        achieved={selectedBudgetForChart.actualAmount || 0}
                        balance={selectedBudgetForChart.remainingBalance || (selectedBudgetForChart.plannedAmount || 0) - (selectedBudgetForChart.actualAmount || 0)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Form Container with black border */}
            <div className="bg-white rounded-lg border-2 border-gray-900">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    {/* Left: Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleNew}
                            className="border-gray-900"
                        >
                            New
                        </Button>
                        <Button 
                            size="sm"
                            onClick={handleConfirm}
                            disabled={formStatus !== "draft"}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                            Confirm
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleRevise}
                            disabled={formStatus !== "confirmed"}
                            className="border-gray-900"
                        >
                            Revise
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleArchive}
                            disabled={!editingId}
                            className="border-gray-900"
                        >
                            Archived
                        </Button>
                    </div>

                    {/* Right: Status Tabs */}
                    <div className="flex items-center space-x-1">
                        <span 
                            className={`px-3 py-1 text-sm rounded ${
                                formStatus === "draft" 
                                    ? "bg-gray-200 text-gray-800 font-medium" 
                                    : "text-gray-500"
                            }`}
                        >
                            Draft
                        </span>
                        <span 
                            className={`px-3 py-1 text-sm rounded ${
                                formStatus === "confirmed" 
                                    ? "bg-yellow-100 text-yellow-800 font-medium" 
                                    : "text-gray-500"
                            }`}
                        >
                            Confirm
                        </span>
                        <span 
                            className={`px-3 py-1 text-sm rounded ${
                                formStatus === "revised" 
                                    ? "bg-purple-100 text-purple-800 font-medium" 
                                    : "text-gray-500"
                            }`}
                        >
                            Revised
                        </span>
                        <span 
                            className={`px-3 py-1 text-sm rounded ${
                                formStatus === "cancelled" 
                                    ? "bg-red-100 text-red-800 font-medium" 
                                    : "text-gray-500"
                            }`}
                        >
                            Cancelled
                        </span>
                    </div>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Budget Name & Revision Links */}
                    <div className="grid grid-cols-2 gap-8 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-pink-600 mb-1">Budget Name</label>
                            <input
                                type="text"
                                placeholder="e.g. January 2026"
                                className={`w-full px-3 py-2 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent ${
                                    errors.name ? 'border-red-500' : ''
                                }`}
                                {...register("name")}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            {/* Show "Revision of" if this is a revision, or "Revised with" if original has revision */}
                            {originalBudgetId ? (
                                <>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Revision of</label>
                                    <button 
                                        type="button"
                                        className="text-indigo-600 hover:underline flex items-center gap-1"
                                        onClick={() => navigateToBudget(originalBudgetId)}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        {originalBudgetName || "Original Budget"}
                                    </button>
                                    <p className="text-gray-400 text-xs mt-1">(Original budget clickable link)</p>
                                </>
                            ) : revisedBudgetId ? (
                                <>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Revised with</label>
                                    <button 
                                        type="button"
                                        className="text-indigo-600 hover:underline flex items-center gap-1"
                                        onClick={() => navigateToBudget(revisedBudgetId)}
                                    >
                                        <Link2 className="w-4 h-4" />
                                        New Revision Budget
                                    </button>
                                    <p className="text-gray-400 text-xs mt-1">(Click to view new revision)</p>
                                </>
                            ) : formStatus === "confirmed" ? (
                                <>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Revision</label>
                                    <p className="text-gray-400 text-sm italic">
                                        Click "Revise" to create a new revision
                                    </p>
                                </>
                            ) : (
                                <>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Revision</label>
                                    <p className="text-gray-400 text-sm italic">
                                        Confirm budget first to enable revisions
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Budget Period */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-pink-600 mb-2">Budget Period</label>
                        <div className="flex items-center gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className={`px-3 py-2 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent ${
                                        errors.periodStart ? 'border-red-500' : ''
                                    }`}
                                    {...register("periodStart")}
                                />
                                {errors.periodStart && (
                                    <p className="text-red-500 text-xs mt-1">{errors.periodStart.message}</p>
                                )}
                            </div>
                            <span className="text-gray-500 font-medium">To</span>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                <input
                                    type="date"
                                    className={`px-3 py-2 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none bg-transparent ${
                                        errors.periodEnd ? 'border-red-500' : ''
                                    }`}
                                    {...register("periodEnd")}
                                />
                                {errors.periodEnd && (
                                    <p className="text-red-500 text-xs mt-1">{errors.periodEnd.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Budget Lines Table */}
                    <div className="border-t border-gray-200 pt-4">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="text-left py-2 text-pink-600 font-medium">Analytic Name</th>
                                    <th className="text-left py-2 text-pink-600 font-medium w-28">Type</th>
                                    <th className="text-left py-2 text-yellow-600 font-medium w-36">Budgeted Amount</th>
                                    <th className="text-left py-2 text-green-600 font-medium w-36">Achieved Amount</th>
                                    <th className="text-left py-2 text-green-600 font-medium w-28">Achieved %</th>
                                    <th className="text-left py-2 text-cyan-600 font-medium w-36">Amount to Achieve</th>
                                    {formStatus === "draft" && <th className="w-12"></th>}
                                </tr>
                            </thead>
                            <tbody>
                                {budgetLines.map((line, index) => {
                                    const achievedPercent = calculateAchievedPercent(line.achievedAmount, line.budgetedAmount);
                                    const amountToAchieve = calculateAmountToAchieve(line.budgetedAmount, line.achievedAmount);
                                    
                                    return (
                                        <tr key={line.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    <span className="text-gray-800">{line.analyticName || '-'}</span>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={line.analyticName}
                                                        onChange={(e) => updateBudgetLine(line.id, 'analyticName', e.target.value)}
                                                        placeholder="Enter analytic name"
                                                        className={`w-full px-2 py-1 border-b ${line.analyticName ? 'border-gray-300' : 'border-red-300'} hover:border-gray-400 focus:border-indigo-500 focus:outline-none bg-transparent text-gray-800`}
                                                        required
                                                    />
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    <span className={line.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                        {line.type === 'income' ? 'Income' : 'Expense'}
                                                    </span>
                                                ) : (
                                                <select
                                                    value={line.type}
                                                    onChange={(e) => updateBudgetLine(line.id, 'type', e.target.value as 'income' | 'expense')}
                                                    className={`px-2 py-1 border-b border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:outline-none bg-transparent cursor-pointer ${
                                                        line.type === 'income' ? 'text-green-600' : 'text-red-600'
                                                    }`}
                                                >
                                                    <option value="income">Income</option>
                                                    <option value="expense">Expense</option>
                                                </select>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    <span className="text-gray-800">
                                                        {line.budgetedAmount > 0 ? `${line.budgetedAmount.toLocaleString()}/-` : '-'}
                                                    </span>
                                                ) : (
                                                    <input
                                                        type="number"
                                                        value={line.budgetedAmount || ''}
                                                        onChange={(e) => updateBudgetLine(line.id, 'budgetedAmount', Number(e.target.value) || 0)}
                                                        placeholder="Enter amount"
                                                        className="w-32 px-2 py-1 border-b border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:outline-none bg-transparent text-gray-800"
                                                        min="0"
                                                        step="100"
                                                    />
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    line.achievedAmount > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-600">{line.achievedAmount.toLocaleString()}/-</span>
                                                            <button
                                                                onClick={() => {
                                                                    // TODO: Open view modal for achieved amount breakdown
                                                                    alert(`View breakdown for ${line.analyticName}`);
                                                                }}
                                                                className="text-indigo-600 hover:underline text-xs"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">0/-</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400 italic text-xs">Auto-calculated</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    line.budgetedAmount > 0 && line.achievedAmount > 0 ? (
                                                        <span className={achievedPercent > 100 ? 'text-red-600' : 'text-gray-800'}>
                                                            {achievedPercent.toFixed(2)} %
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">View</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {formStatus === "confirmed" || formStatus === "revised" ? (
                                                    line.budgetedAmount > 0 ? (
                                                        <span className={amountToAchieve < 0 ? 'text-red-600' : 'text-cyan-600'}>
                                                            {amountToAchieve.toLocaleString()}/-
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            {formStatus === "draft" && (
                                                <td className="py-3 text-center">
                                                    {budgetLines.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBudgetLine(line.id)}
                                                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                                            title="Remove line"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Add Line Button - only show in draft mode */}
                        {formStatus === "draft" && (
                            <div className="mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addBudgetLine}
                                    leftIcon={<Plus className="w-4 h-4" />}
                                    className="border-dashed border-gray-400 hover:border-indigo-500"
                                >
                                    Add Budget Line
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Totals Summary (shown only in draft mode) */}
                    {formStatus === "draft" && budgetLines.some(l => l.budgetedAmount > 0) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Budget Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Total Income Budget:</span>
                                    <span className="ml-2 font-medium text-green-600">
                                        ₹{budgetLines.filter(l => l.type === 'income').reduce((sum, l) => sum + l.budgetedAmount, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Expense Budget:</span>
                                    <span className="ml-2 font-medium text-red-600">
                                        ₹{budgetLines.filter(l => l.type === 'expense').reduce((sum, l) => sum + l.budgetedAmount, 0).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Total Budget:</span>
                                    <span className="ml-2 font-medium text-indigo-600">
                                        ₹{budgetLines.reduce((sum, l) => sum + l.budgetedAmount, 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setView("list");
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                leftIcon={<Save className="w-4 h-4" />}
                                disabled={loading || budgetLines.every(l => !l.analyticName.trim() || l.budgetedAmount <= 0)}
                            >
                                {loading ? 'Saving...' : (editingId ? 'Update Budget' : 'Save Budget')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
