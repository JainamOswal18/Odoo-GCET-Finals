import React, { useState, useEffect } from "react";
import { Plus, ArrowLeft, Save, Archive } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card } from "@/components/ui";
import { analyticalAccountsApi } from "@/lib/api";
import type { AnalyticalAccount } from "@/lib/types";

const analyticSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"), // Added code for identification
    description: z.string().optional(),
});

type AnalyticFormData = z.infer<typeof analyticSchema>;

export const AnalyticalAccounts: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [accounts, setAccounts] = useState<AnalyticalAccount[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("confirm");
    const [_loading, setLoading] = useState(false);
    const [_error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await analyticalAccountsApi.getAll();
            setAccounts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytical accounts');
        } finally {
            setLoading(false);
        }
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnalyticFormData>({
        resolver: zodResolver(analyticSchema),
    });

    const onSubmit = async (data: AnalyticFormData) => {
        try {
            setLoading(true);
            setError(null);

            if (editingId) {
                await analyticalAccountsApi.update(editingId, data);
            } else {
                await analyticalAccountsApi.create(data);
            }

            await fetchAccounts();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save analytical account');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (account: AnalyticalAccount) => {
        setEditingId(account.id);
        reset({
            name: account.name,
            code: account.code,
            description: account.description,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ code: `ANA-${Math.floor(Math.random() * 1000)}` });
        setView("form");
    };

    const handleArchive = async () => {
        if (!editingId) return;

        if (!confirm('Are you sure you want to archive this analytical account?')) {
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('shiv_auth_token');
            const response = await fetch(`http://localhost:5000/api/analytical-accounts/${editingId}/archive`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to archive analytical account');
            }

            await fetchAccounts();
            setView('list');
            setEditingId(null);
            reset();
        } catch (err: any) {
            setError(err.message || 'Failed to archive analytical account');
        } finally {
            setLoading(false);
        }
    };

    // Filter accounts based on activeTab and search
    const filteredAccounts = accounts.filter((account) => {
        // Filter by active status based on tab
        const isActive = Number(account.active ?? 1); // Default to active if undefined
        const activeFilter = activeTab === 'archived' ? isActive === 0 : isActive === 1;

        // Filter by search term
        const searchFilter = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (account.code || '').toLowerCase().includes(searchTerm.toLowerCase());

        return activeFilter && searchFilter;
    });

    if (view === "list") {
        return (
            <div className="space-y-6">
                {/* Header with Navigation */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-xl font-bold text-gray-900">Analytics Master</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">Home</Button>
                            <Button variant="ghost" size="sm">Back</Button>
                        </div>
                    </div>
                </div>

                <Card className="p-8">
                    {/* Tabs for Active/Archived */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setActiveTab("confirm")}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "confirm"
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab("archived")}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === "archived"
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            Archived
                        </button>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Analytic Name</h2>
                    </div>

                    <div className="space-y-1">
                        {filteredAccounts.map((account) => (
                            <div
                                key={account.id}
                                onClick={() => handleEdit(account)}
                                className="p-4 border-b border-gray-200 hover:bg-pink-50 cursor-pointer transition-colors text-pink-600 font-medium"
                            >
                                {account.name}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6">
                        <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                            Add Line
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setView("list")}
                        leftIcon={<ArrowLeft className="w-4 h-4" />}
                    >
                        Back
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">
                        {editingId ? "Edit Analytic" : "New Analytic"}
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        onClick={handleSubmit(onSubmit)}
                        leftIcon={<Save className="w-4 h-4" />}
                        disabled={_loading}
                    >
                        {_loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                    </Button>
                    <Button
                        variant="outline"
                        leftIcon={<Archive className="w-4 h-4" />}
                        onClick={handleArchive}
                        disabled={_loading || !editingId}
                    >
                        Archive
                    </Button>
                </div>
            </div>

            <Card className="p-8 max-w-2xl mx-auto">
                <div className="space-y-6">
                    <Input
                        placeholder="e.g. Furniture Expo 2026"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-2 focus:ring-0 focus:border-indigo-600"
                        label="Analytic Name"
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <div className="grid grid-cols-1 gap-6">
                        <Input
                            label="Code"
                            placeholder="e.g. ANA-001"
                            error={errors.code?.message}
                            {...register("code")}
                        />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Purpose of this cost center..."
                                {...register("description")}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
