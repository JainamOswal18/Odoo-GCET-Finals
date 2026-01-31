import React, { useState } from "react";
import { Plus, ArrowLeft, Save, Archive } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card } from "@/components/ui";
import { MOCK_ANALYTICAL_ACCOUNTS } from "@/lib/mock";
import type { AnalyticalAccount } from "@/lib/types";

const analyticSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"), // Added code for identification
    description: z.string().optional(),
});

type AnalyticFormData = z.infer<typeof analyticSchema>;

export const AnalyticalAccounts: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [accounts, setAccounts] = useState<AnalyticalAccount[]>(MOCK_ANALYTICAL_ACCOUNTS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("confirm");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<AnalyticFormData>({
        resolver: zodResolver(analyticSchema),
    });

    const onSubmit = (data: AnalyticFormData) => {
        if (editingId) {
            setAccounts((prev) =>
                prev.map((a) =>
                    a.id === editingId
                        ? { ...a, ...data, updatedAt: new Date().toISOString() }
                        : a
                )
            );
        } else {
            const newAccount: AnalyticalAccount = {
                id: crypto.randomUUID(),
                ...data,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setAccounts((prev) => [...prev, newAccount]);
        }
        setView("list");
        reset();
        setEditingId(null);
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

    const filteredAccounts = accounts.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                </div>

                <Card className="p-8">
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
                    >
                        Confirm
                    </Button>
                    <Button variant="outline" leftIcon={<Archive className="w-4 h-4" />}>
                        Archived
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
