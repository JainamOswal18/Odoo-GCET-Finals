import React, { useState } from "react";
import { Plus, Search, Filter, Save, CreditCard, AlertTriangle } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { MOCK_CONTACTS, MOCK_PRODUCTS, MOCK_ANALYTICAL_ACCOUNTS } from "@/lib/mock";
import type { VendorBill, LineItem, PaymentStatus } from "@/lib/types";

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
    analyticalAccountId: z.string().optional(),
});

const vendorBillSchema = z.object({
    vendorId: z.string().min(1, "Vendor is required"),
    billReference: z.string().optional(),
    purchaseOrderId: z.string().optional(),
    billDate: z.string().min(1, "Bill date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
    notes: z.string().optional(),
});

type BillFormData = z.infer<typeof vendorBillSchema>;

const MOCK_BILLS: VendorBill[] = [
    {
        id: "1",
        billNumber: "BILL/2025/0001",
        vendorId: "2",
        vendorName: "Azure Interior",
        purchaseOrderId: "1",
        purchaseOrderNumber: "PO0001",
        billDate: "2026-01-25",
        dueDate: "2026-02-25",
        status: "confirmed",
        paymentStatus: "unpaid",
        lineItems: [
            {
                id: "1",
                productId: "1",
                productName: "Table",
                quantity: 6,
                unitPrice: 2300,
                taxRate: 18,
                taxAmount: 2484,
                subtotal: 13800,
                total: 16284,
                analyticalAccountId: "2",
                analyticalAccountName: "Deepawali",
            },
        ],
        subtotal: 13800,
        taxTotal: 2484,
        grandTotal: 16350,
        amountPaid: 0,
        amountDue: 16350,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
];

export const VendorBills: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [bills, setBills] = useState<VendorBill[]>(MOCK_BILLS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<"draft" | "confirmed" | "cancelled">("draft");
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BillFormData>({
        resolver: zodResolver(vendorBillSchema),
        defaultValues: {
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "lineItems",
    });

    const watchLineItems = watch("lineItems");

    const calculateLineTotal = (quantity: number, unitPrice: number) => {
        const subtotal = quantity * unitPrice;
        const taxAmount = subtotal * 0.18;
        return subtotal + taxAmount;
    };

    const grandTotal = watchLineItems?.reduce((sum, item) => {
        return sum + calculateLineTotal(item.quantity || 0, item.unitPrice || 0);
    }, 0) || 0;

    const calculatePaymentStatus = (amountPaid: number, grandTotal: number): PaymentStatus => {
        if (amountPaid === 0) return "unpaid";
        if (amountPaid >= grandTotal) return "paid";
        return "partial";
    };

    const onSubmit = (data: BillFormData) => {
        const vendor = MOCK_CONTACTS.find(c => c.id === data.vendorId);

        const processedLineItems: LineItem[] = data.lineItems.map((item, index) => {
            const product = MOCK_PRODUCTS.find(p => p.id === item.productId);
            const analyticAccount = MOCK_ANALYTICAL_ACCOUNTS.find(a => a.id === item.analyticalAccountId);
            const subtotal = item.quantity * item.unitPrice;
            const taxAmount = subtotal * 0.18;
            const total = subtotal + taxAmount;

            return {
                id: `${index + 1}`,
                productId: item.productId,
                productName: product?.name || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                taxRate: 18,
                taxAmount,
                subtotal,
                total,
                analyticalAccountId: item.analyticalAccountId,
                analyticalAccountName: analyticAccount?.name,
            };
        });

        const subtotal = processedLineItems.reduce((sum, item) => sum + item.subtotal, 0);
        const taxTotal = processedLineItems.reduce((sum, item) => sum + item.taxAmount, 0);
        const total = subtotal + taxTotal;

        if (editingId) {
            setBills((prev) =>
                prev.map((b) =>
                    b.id === editingId
                        ? {
                            ...b,
                            ...data,
                            vendorName: vendor?.name,
                            lineItems: processedLineItems,
                            subtotal,
                            taxTotal,
                            grandTotal: total,
                            amountDue: total - b.amountPaid,
                            paymentStatus: calculatePaymentStatus(b.amountPaid, total),
                            status: status,
                            updatedAt: new Date().toISOString()
                        }
                        : b
                )
            );
        } else {
            const newBill: VendorBill = {
                id: crypto.randomUUID(),
                billNumber: `BILL/2025/${String(bills.length + 1).padStart(4, '0')}`,
                vendorId: data.vendorId,
                vendorName: vendor?.name || "",
                purchaseOrderId: data.purchaseOrderId,
                billDate: data.billDate,
                dueDate: data.dueDate,
                status: status,
                paymentStatus: "unpaid",
                lineItems: processedLineItems,
                subtotal,
                taxTotal,
                grandTotal: total,
                amountPaid: 0,
                amountDue: total,
                notes: data.notes,
                billReference: data.billReference,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setBills((prev) => [...prev, newBill]);
        }
        setView("list");
        reset();
        setEditingId(null);
    };

    const handleEdit = (bill: VendorBill) => {
        setEditingId(bill.id);
        setStatus(bill.status);
        reset({
            vendorId: bill.vendorId,
            billDate: bill.billDate,
            dueDate: bill.dueDate,
            purchaseOrderId: bill.purchaseOrderId,
            billReference: bill.billReference,
            lineItems: bill.lineItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                analyticalAccountId: item.analyticalAccountId || "none",
            })),
            notes: bill.notes,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        setStatus("draft");
        setShowBudgetWarning(false);
        reset({
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" }],
        });
        setView("form");
    };

    const handleConfirm = () => {
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

    const handlePay = (bill: VendorBill) => {
        console.log("Opening payment for bill:", bill.billNumber);
        // This would open the payment form
    };

    const filteredBills = bills.filter((b) =>
        b.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentBill = editingId ? bills.find(b => b.id === editingId) : null;

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Bills</h1>
                        <p className="text-gray-500">Manage vendor bills and payments</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Bill
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search bills..."
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
                                    <th className="px-4 py-3 rounded-tl-lg">Bill Number</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">Bill Date</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-right">Amount Due</th>
                                    <th className="px-4 py-3">Payment Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBills.map((bill) => (
                                    <tr
                                        key={bill.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(bill)}
                                    >
                                        <td className="px-4 py-3 font-medium text-indigo-600">
                                            {bill.billNumber}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{bill.vendorName}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(bill.billDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(bill.dueDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            ₹{bill.grandTotal.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">
                                            ₹{bill.amountDue.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${bill.paymentStatus === "paid"
                                                        ? "bg-green-100 text-green-700"
                                                        : bill.paymentStatus === "partial"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {bill.paymentStatus === "paid" ? "Paid" : bill.paymentStatus === "partial" ? "Partial" : "Not Paid"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {bill.amountDue > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePay(bill);
                                                    }}
                                                    leftIcon={<CreditCard className="w-3 h-3" />}
                                                >
                                                    Pay
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
                        <h1 className="text-xl font-bold text-gray-900">Vendor Bill</h1>
                        {currentBill && (
                            <span className="text-sm font-medium text-green-600">
                                From Bill: {currentBill.billNumber}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        {currentBill && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={currentBill.paymentStatus === "paid" ? "bg-green-100" : ""}
                                >
                                    Paid
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={currentBill.paymentStatus === "partial" ? "bg-yellow-100" : ""}
                                >
                                    Partial
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={currentBill.paymentStatus === "unpaid" ? "bg-red-100" : ""}
                                >
                                    Not Paid
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Budget Warning */}
                {showBudgetWarning && status === "confirmed" && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-yellow-800">
                                    Non Blocking Warning on Confirmation of Bill
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
                        {currentBill && currentBill.amountDue > 0 && (
                            <Button
                                variant="secondary"
                                leftIcon={<CreditCard className="w-4 h-4" />}
                                onClick={() => handlePay(currentBill)}
                            >
                                Pay
                            </Button>
                        )}
                        <Button variant="outline" className="ml-auto">
                            Budget
                        </Button>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className={status === "draft" ? "bg-gray-100" : ""}>Draft</Button>
                            <Button variant="ghost" size="sm" className={status === "confirmed" ? "bg-pink-100" : ""}>Confirm</Button>
                            <Button variant="ghost" size="sm" className={status === "cancelled" ? "bg-gray-100" : ""}>Cancelled</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bill Details */}
            <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vendor Bill No.
                        </label>
                        <div className="text-lg font-semibold text-indigo-600">
                            {currentBill?.billNumber || `BILL/2025/${String(bills.length + 1).padStart(4, '0')}`}
                        </div>
                        <p className="text-xs text-gray-500">Auto generate Bill Number + 1 of last Bill</p>
                    </div>
                    <div>
                        <Input
                            label="Bill Date"
                            type="date"
                            error={errors.billDate?.message}
                            {...register("billDate")}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Select
                        label="Vendor Name"
                        options={MOCK_CONTACTS.filter(c => c.type === "vendor" || c.type === "both").map(c => ({
                            value: c.id,
                            label: c.name
                        }))}
                        value={watch("vendorId")}
                        onValueChange={(val) => setValue("vendorId", val)}
                        error={errors.vendorId?.message}
                    />
                    <Input
                        label="Bill Reference"
                        placeholder="SUP-25-001"
                        {...register("billReference")}
                    />
                    <Input
                        label="Due Date"
                        type="date"
                        error={errors.dueDate?.message}
                        {...register("dueDate")}
                    />
                </div>

                {/* Line Items Table */}
                <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left p-2 font-medium text-gray-700">Sr. No.</th>
                                <th className="text-left p-2 font-medium text-gray-700">Product</th>
                                <th className="text-left p-2 font-medium text-gray-700">Budget Analytics</th>
                                <th className="text-center p-2 font-medium text-indigo-600">Qty</th>
                                <th className="text-center p-2 font-medium text-indigo-600">Unit Price</th>
                                <th className="text-right p-2 font-medium text-indigo-600">Total</th>
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
                                                options={MOCK_PRODUCTS.map(p => ({
                                                    value: p.id,
                                                    label: p.name
                                                }))}
                                                value={watchLineItems[index]?.productId}
                                                onValueChange={(val) => {
                                                    const prod = MOCK_PRODUCTS.find(p => p.id === val);
                                                    setValue(`lineItems.${index}.productId`, val);
                                                    if (prod) {
                                                        setValue(`lineItems.${index}.unitPrice`, prod.purchasePrice);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                options={[
                                                    { value: "none", label: "None" },
                                                    ...MOCK_ANALYTICAL_ACCOUNTS.map(a => ({
                                                        value: a.id,
                                                        label: a.name
                                                    }))
                                                ]}
                                                value={watchLineItems[index]?.analyticalAccountId || "none"}
                                                onValueChange={(val) => setValue(`lineItems.${index}.analyticalAccountId`, val === "none" ? "" : val)}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-20 p-1 border rounded text-center"
                                                {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                className="w-24 p-1 border rounded text-right"
                                                {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
                                            />
                                        </td>
                                        <td className="p-2 text-right font-medium">
                                            ₹{total.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-300">
                                <td colSpan={5} className="p-3 text-right font-semibold">Total</td>
                                <td className="p-3 text-right font-bold text-lg">₹{grandTotal.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {currentBill && (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Paid Via Cash:</span>
                            <span>₹{currentBill.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium">Paid Via Bank:</span>
                            <span>₹{currentBill.amountPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-red-600 border-t pt-2">
                            <span>Amount Due:</span>
                            <span>₹{currentBill.amountDue.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">(Total - Payment)</p>
                    </div>
                )}

                <div className="mt-4 flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" })}
                        leftIcon={<Plus className="w-4 h-4" />}
                    >
                        Add Line
                    </Button>
                </div>
            </Card>
        </div>
    );
};
