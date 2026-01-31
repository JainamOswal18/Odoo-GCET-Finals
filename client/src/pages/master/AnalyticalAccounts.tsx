import React, { useState } from "react";
import { Plus, Search, Filter, ArrowLeft, Save, Archive } from "lucide-react";
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
    const [searchTerm, setSearchTerm] = useState("");

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics Master</h1>
                        <p className="text-gray-500">Manage cost centers and track expenses</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Analytic
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search analytics..."
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
                                    <th className="px-4 py-3 rounded-tl-lg">Analytic Name</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Description</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAccounts.map((account) => (
                                    <tr
                                        key={account.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(account)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {account.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                            {account.code}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {account.description || "-"}
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
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-0 focus:ring-0 focus:border-indigo-600 px-2"
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
