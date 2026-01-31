import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Save, FileText, AlertTriangle, Package, Loader2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { purchaseOrdersApi, contactsApi, productsApi, analyticalAccountsApi } from "@/lib/api";
import type { PurchaseOrder } from "@/lib/types";

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
    analyticalAccountId: z.string().optional(),
});

const purchaseOrderSchema = z.object({
    vendorId: z.string().min(1, "Vendor is required"),
    reference: z.string().optional(),
    orderDate: z.string().min(1, "Order date is required"),
    expectedDate: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
    notes: z.string().optional(),
});

type POFormData = z.infer<typeof purchaseOrderSchema>;

export const PurchaseOrders: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<"draft" | "confirmed" | "done" | "cancelled">("draft");
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [ordersData, contactsData, productsData, accountsData] = await Promise.all([
                purchaseOrdersApi.getAll(),
                contactsApi.getAll(),
                productsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            setOrders(ordersData as PurchaseOrder[]);
            setContacts(contactsData);
            setProducts(productsData);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching purchase orders data:', err);
        } finally {
            setLoading(false);
        }
    };

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<POFormData>({
        resolver: zodResolver(purchaseOrderSchema),
        defaultValues: {
            orderDate: new Date().toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems",
    });

    const watchLineItems = watch("lineItems");

    // Calculate totals
    const calculateLineTotal = (quantity: number, unitPrice: number) => {
        const subtotal = quantity * unitPrice;
        const taxAmount = subtotal * 0.18; // 18% tax
        return subtotal + taxAmount;
    };

    const grandTotal = watchLineItems?.reduce((sum, item) => {
        return sum + calculateLineTotal(item.quantity || 0, item.unitPrice || 0);
    }, 0) || 0;

    const onSubmit = async (data: POFormData) => {
        try {
            setLoading(true);
            setError(null);

            const lineItemsPayload = data.lineItems.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                analytical_account_id: item.analyticalAccountId || null,
            }));

            const payload = {
                vendor_id: data.vendorId,
                order_date: data.orderDate,
                expected_date: data.expectedDate || null,
                status: status,
                notes: data.notes || null,
                line_items: lineItemsPayload,
            };

            if (editingId) {
                await purchaseOrdersApi.update(editingId, payload);
            } else {
                await purchaseOrdersApi.create(payload);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save purchase order');
            console.error('Error saving purchase order:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (po: PurchaseOrder) => {
        setEditingId(po.id);
        setStatus(po.status);
        reset({
            vendorId: po.vendorId,
            orderDate: po.orderDate,
            expectedDate: po.expectedDate,
            lineItems: po.lineItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                analyticalAccountId: item.analyticalAccountId || "none",
            })),
            notes: po.notes,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        setStatus("draft");
        setShowBudgetWarning(false);
        reset({
            orderDate: new Date().toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" }],
        });
        setView("form");
    };

    const handleConfirm = () => {
        // First validate and submit the form
        handleSubmit((data) => {
            onSubmit(data);
            setStatus("confirmed");
            setShowBudgetWarning(true);
        })();
    };

    const handleCancel = () => {
        setStatus("cancelled");
    };

    const handleSave = () => {
        handleSubmit(onSubmit)();
    };

    const handleCreateBill = (po: PurchaseOrder) => {
        // Navigate to vendor bill with PO data
        console.log("Creating bill from PO:", po.orderNumber);
        // This would navigate to vendor bills page with pre-filled data
    };

    const filteredOrders = orders.filter((o) =>
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (view === "list") {
        return (
            <div className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                        <p className="text-gray-500">Manage vendor purchase orders</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New PO
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search purchase orders..."
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
                                    <th className="px-4 py-3 rounded-tl-lg">PO Number</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((po) => (
                                    <tr
                                        key={po.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(po)}
                                    >
                                        <td className="px-4 py-3 font-medium text-indigo-600">
                                            {po.orderNumber}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{po.vendorName}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(po.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            ₹{po.grandTotal.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${po.status === "confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : po.status === "draft"
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {po.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {po.status === "confirmed" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCreateBill(po);
                                                    }}
                                                    leftIcon={<FileText className="w-3 h-3" />}
                                                >
                                                    Create Bill
                                                </Button>
                                            )}
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

    // Form View
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={() => setView("list")}>
                            Home
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setView("list")}>
                            Back
                        </Button>
                        <h1 className="text-xl font-bold text-gray-900">Purchase Order</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={status === "draft" ? "bg-gray-100" : ""}
                        >
                            Draft
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={status === "confirmed" ? "bg-pink-100" : ""}
                        >
                            Confirm
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={status === "cancelled" ? "bg-gray-100" : ""}
                        >
                            Cancelled
                        </Button>
                    </div>
                </div>

                {/* Budget Warning */}
                {showBudgetWarning && status === "confirmed" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-yellow-800">
                                    Non Blocking Warning on Confirmation of PO
                                </h3>
                                <p className="text-sm text-yellow-700 mt-1">
                                    ⚠️ Exceeds Approved Budget
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    The entered amount is higher than the remaining budget amount for this analytical account.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />}>
                            Save
                        </Button>
                        <Button onClick={handleConfirm} disabled={status === "confirmed"}>
                            Confirm
                        </Button>
                        <Button variant="outline" onClick={() => window.print()}>Print</Button>
                        <Button variant="outline">Send</Button>
                        <Button variant="outline" onClick={handleCancel} disabled={status === "cancelled"}>Cancel</Button>
                        {status === "confirmed" && (
                            <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />} onClick={() => {
                                console.log("Navigate to Create Bill with PO data");
                                alert("Create Bill functionality - will navigate to Vendor Bills page with pre-filled data");
                            }}>
                                Create Bill
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            leftIcon={<Package className="w-4 h-4" />}
                            className="ml-auto"
                        >
                            Budget
                        </Button>
                    </div>
                </div>
            </div>

            {/* PO Details */}
            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PO No.
                        </label>
                        <div className="text-lg font-semibold text-indigo-600">
                            {editingId ? orders.find(o => o.id === editingId)?.orderNumber : `PO${String(orders.length + 1).padStart(4, '0')}`}
                        </div>
                        <p className="text-xs text-gray-500">Auto generate PO Number + 1 of last order</p>
                    </div>
                    <div>
                        <Input
                            label="PO Date"
                            type="date"
                            error={errors.orderDate?.message}
                            {...register("orderDate")}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Select
                        label="Vendor Name"
                        options={contacts.filter(c => (c.type === "vendor" || c.type === "both") || (c.contactType === "vendor" || c.contactType === "both")).map(c => ({
                            value: c.id,
                            label: c.name
                        }))}
                        value={watch("vendorId")}
                        onValueChange={(val) => setValue("vendorId", val)}
                        error={errors.vendorId?.message}
                    />
                    <Input
                        label="Reference"
                        placeholder="REQ-25-0001"
                        {...register("reference")}
                    />
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-2 font-medium text-gray-700">Sr. No.</th>
                                <th className="text-left p-2 font-medium text-gray-700">Product</th>
                                <th className="text-left p-2 font-medium text-gray-700">Budget Analytics</th>
                                <th className="text-center p-2 font-medium text-indigo-600">1<br />Qty</th>
                                <th className="text-center p-2 font-medium text-indigo-600">2<br />Unit Price</th>
                                <th className="text-right p-2 font-medium text-indigo-600">3<br />Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => {
                                const total = calculateLineTotal(
                                    watchLineItems[index]?.quantity || 0,
                                    watchLineItems[index]?.unitPrice || 0
                                );

                                return (
                                    <tr key={field.id} className="border-b border-gray-100">
                                        <td className="p-2">{index + 1}</td>
                                        <td className="p-2">
                                            <Select
                                                options={products.map(p => ({
                                                    value: p.id,
                                                    label: p.name
                                                }))}
                                                value={watchLineItems[index]?.productId}
                                                onValueChange={(val) => {
                                                    const prod = products.find(p => p.id === val);
                                                    setValue(`lineItems.${index}.productId`, val);
                                                    if (prod) {
                                                        setValue(`lineItems.${index}.unitPrice`, prod.purchasePrice);
                                                    }
                                                }}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">From Product Master - Many to one</p>
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                options={[
                                                    { value: "none", label: "None" },
                                                    ...analyticalAccounts.map(a => ({
                                                        value: a.id,
                                                        label: a.name
                                                    }))
                                                ]}
                                                value={watchLineItems[index]?.analyticalAccountId || "none"}
                                                onValueChange={(val) => setValue(`lineItems.${index}.analyticalAccountId`, val === "none" ? "" : val)}
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {watchLineItems[index]?.analyticalAccountId && watchLineItems[index]?.analyticalAccountId !== "none"
                                                    ? "From Analytical Master - Many to One"
                                                    : "Auto Compute From Auto Analytical Model (based on combination)"}
                                            </p>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-20 p-1 border rounded text-center"
                                                {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                                            />
                                            <p className="text-xs text-gray-500 text-center">Number</p>
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-24 p-1 border rounded text-right"
                                                {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                                            />
                                            <p className="text-xs text-gray-500 text-center">Monetary</p>
                                        </td>
                                        <td className="p-2 text-right font-medium">
                                            ₹{total.toLocaleString()}
                                            <p className="text-xs text-gray-500">
                                                ({watchLineItems[index]?.quantity || 0} × ₹{watchLineItems[index]?.unitPrice || 0})
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-300">
                                <td colSpan={5} className="p-3 text-right font-semibold">
                                    Total
                                </td>
                                <td className="p-3 text-right font-bold text-lg text-indigo-600">
                                    ₹{grandTotal.toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" })}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add Line
                    </Button>
                    {fields.length > 1 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(fields.length - 1)}
                        >
                            Remove Last Line
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};
