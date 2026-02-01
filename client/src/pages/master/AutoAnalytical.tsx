import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Save, Archive, Settings2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { autoAnalyticalModelsApi, analyticalAccountsApi } from "@/lib/api";
import type { AutoAnalyticalModel, AnalyticalAccount } from "@/lib/types";

const modelSchema = z.object({
    name: z.string().min(1, "Name is required"),
    priority: z.number().min(0, "Priority must be positive"),
    analyticAccountId: z.string().min(1, "Analytic Account is required"),
    // Optional conditions
    partnerTag: z.string().optional(),
    productCategory: z.string().optional(),
    partnerId: z.string().optional(),
    productId: z.string().optional(),
});

type ModelFormData = z.infer<typeof modelSchema>;

export const AutoAnalytical: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [models, setModels] = useState<AutoAnalyticalModel[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<AnalyticalAccount[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("confirm");
    // const [status] = useState<"draft" | "confirm" | "cancelled">("draft");
    const [_loading, setLoading] = useState(false);
    const [_error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [modelsData, accountsData] = await Promise.all([
                autoAnalyticalModelsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            console.log('Models fetched:', modelsData);
            console.log('Analytical accounts fetched:', accountsData);
            
            // Map backend data to ensure proper field names
            const mappedModels = modelsData.map((model: any) => ({
                ...model,
                analyticAccountName: model.analyticalAccountName || model.analytical_account_name,
            }));
            console.log('Mapped models:', mappedModels);
            
            setModels(mappedModels);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            console.error('Fetch error:', err);
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
    } = useForm<ModelFormData>({
        resolver: zodResolver(modelSchema),
        defaultValues: {
            priority: 10,
        },
    });

    const onSubmit = async (data: ModelFormData) => {
        try {
            setLoading(true);
            setError(null);
            
            if (editingId) {
                await autoAnalyticalModelsApi.update(editingId, data);
            } else {
                await autoAnalyticalModelsApi.create(data);
            }
            
            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save model');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (model: AutoAnalyticalModel) => {
        setEditingId(model.id);
        reset({
            name: model.name,
            priority: model.priority,
            analyticAccountId: model.analyticAccountId,
            partnerTag: model.partnerTag,
            productCategory: model.productCategory,
            partnerId: model.partnerId,
            productId: model.productId,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ priority: 10 });
        setView("form");
    };

    const filteredModels = models.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Auto Analytical Models</h1>
                        <p className="text-gray-500">Automate cost center assignment</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Model
                    </Button>
                </div>

                <Card className="p-4">
                    {_error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {_error}
                        </div>
                    )}
                    
                    {_loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading models...</div>
                        </div>
                    ) : (
                        <>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search models..."
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
                                    <th className="px-4 py-3 rounded-tl-lg">Sequence</th>
                                    <th className="px-4 py-3">Model Name</th>
                                    <th className="px-4 py-3">Apply To (Analytic)</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Conditions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredModels.sort((a, b) => a.priority - b.priority).map((model) => (
                                    <tr
                                        key={model.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(model)}
                                    >
                                        <td className="px-4 py-3 text-gray-500 font-mono">
                                            {model.priority}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {model.name}
                                        </td>
                                        <td className="px-4 py-3 text-indigo-600 font-medium">
                                            {model.analyticAccountName || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-xs">
                                            {[
                                                model.partnerTag && `Tag: ${model.partnerTag}`,
                                                model.productCategory && `Cat: ${model.productCategory}`,
                                            ].filter(Boolean).join(", ") || "No specific conditions"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredModels.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No models found. Click "New Model" to create one.
                            </div>
                        )}
                    </div>
                    </>
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
                        <h1 className="text-xl font-bold text-gray-900">Auto Analytical Model</h1>
                        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Dependable System</span>
                    </div>
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
                        placeholder="e.g. Office Expenses Rule"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-2 focus:ring-0 focus:border-indigo-600"
                        label="Model Name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <Input
                            label="Sequence (Priority)"
                            type="number"
                            placeholder="Lower number = Higher priority"
                            error={errors.priority?.message}
                            {...register("priority", { valueAsNumber: true })}
                        />

                        <Select
                            label="Analytic Account to Apply"
                            options={analyticalAccounts.map(a => ({
                                value: a.id,
                                label: `${a.code} - ${a.name}`
                            }))}
                            value={watch("analyticAccountId")}
                            onValueChange={(val) => setValue("analyticAccountId", val)}
                            error={errors.analyticAccountId?.message}
                        />
                    </div>

                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Settings2 className="w-4 h-4" />
                            Conditions
                        </h3>
                        <p className="text-sm text-gray-500 -mt-4 mb-4">
                            Apply this analytical account if the transaction matches these criteria:
                        </p>

                        <div className="space-y-4">
                            <Input
                                label="Partner Tag"
                                placeholder="e.g. Raw Material"
                                {...register("partnerTag")}
                            />
                            <Input
                                label="Product Category"
                                placeholder="e.g. Office Furniture"
                                {...register("productCategory")}
                            />
                            {/* Future expansions: Partner, Product Selects */}
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Partner (ID)"
                                    placeholder="Specific Partner"
                                    {...register("partnerId")}
                                />
                                <Input
                                    label="Product (ID)"
                                    placeholder="Specific Product"
                                    {...register("productId")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
