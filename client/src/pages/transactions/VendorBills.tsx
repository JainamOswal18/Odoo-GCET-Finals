import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Search, Filter, Save, CreditCard, AlertTriangle, FileDown } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { billsApi, purchaseOrdersApi, contactsApi, productsApi, analyticalAccountsApi } from "@/lib/api";
import { generateVendorBillPDF } from "@/lib/pdfGenerator";
import type { VendorBill } from "@/lib/types";

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

export const VendorBills: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [bills, setBills] = useState<VendorBill[]>([]);
    const [_purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [_loading, setLoading] = useState(false);
    const [_error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, []);

    // Handle pre-populated data from Purchase Order
    useEffect(() => {
        const state = location.state as any;
        if (state?.fromPO && state?.poData) {
            const po = state.poData;
            setView("form");
            setEditingId(null);
            setStatus("draft");
            
            // Pre-fill form with PO data
            setTimeout(() => {
                reset({
                    vendorId: String(po.vendorId),
                    purchaseOrderId: String(po.id),
                    billDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    billReference: po.orderNumber || po.poNumber,
                    lineItems: (po.lineItems || []).map((item: any) => ({
                        productId: String(item.productId),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        analyticalAccountId: item.analyticalAccountId ? String(item.analyticalAccountId) : "none",
                    })),
                    notes: `Created from PO: ${po.orderNumber || po.poNumber}`,
                });
            }, 100);
            
            // Clear location state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [billsData, posData, contactsData, productsData, accountsData] = await Promise.all([
                billsApi.getAll(),
                purchaseOrdersApi.getAll(),
                contactsApi.getAll(),
                productsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            setBills(billsData as VendorBill[]);
            setPurchaseOrders(posData);
            setContacts(contactsData);
            setProducts(productsData);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching vendor bills data:', err);
        } finally {
            setLoading(false);
        }
    };
    const [status, setStatus] = useState<"draft" | "confirmed" | "done" | "cancelled">("draft");
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
            vendorId: "",
            billDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "" }],
        },
    });

    const { fields, append, remove: _remove } = useFieldArray({
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

    const onSubmit = async (data: BillFormData) => {
        try {
            setLoading(true);
            setError(null);

            // Backend expects: lines with product_id, quantity, unit_price, analytical_account_id
            const lineItemsPayload = data.lineItems.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_rate: 18, // 18% GST
                analytical_account_id: item.analyticalAccountId || null,
            }));

            const payload = {
                vendor_id: data.vendorId,
                po_id: data.purchaseOrderId || null,
                bill_date: data.billDate,
                due_date: data.dueDate,
                notes: data.notes || null,
                lines: lineItemsPayload,
            };

            if (editingId) {
                await billsApi.update(editingId, payload);
            } else {
                await billsApi.create(payload);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save vendor bill');
            console.error('Error saving vendor bill:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (bill: VendorBill) => {
        try {
            const response: any = await billsApi.getById(bill.id);
            const fullBill = response.bill;
            const lines = response.lines || [];
            
            setEditingId(fullBill.id);
            setStatus(fullBill.status);
            reset({
                vendorId: String(fullBill.vendorId),
                billDate: fullBill.billDate,
                dueDate: fullBill.dueDate,
                purchaseOrderId: fullBill.purchaseOrderId,
                billReference: fullBill.billReference,
                lineItems: lines.map((item: any) => ({
                    productId: String(item.productId),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    analyticalAccountId: item.analyticalAccountId ? String(item.analyticalAccountId) : "none",
                })),
                notes: fullBill.notes,
            });
            setView("form");
        } catch (err: any) {
            setError(err.message || 'Failed to fetch bill details');
        }
    };

    const handleNew = () => {
        setEditingId(null);
        setStatus("draft");
        setShowBudgetWarning(false);
        reset({
            vendorId: "",
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
        (b.billNumber || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.vendorName || '')?.toLowerCase().includes(searchTerm.toLowerCase())
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
                                            ₹{(bill.grandTotal || bill.totalAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">
                                            ₹{(bill.amountDue || 0).toLocaleString()}
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
                        <Button variant="outline" onClick={() => {
                            if (editingId) {
                                const bill = bills.find(b => b.id === editingId);
                                const vendor = contacts.find(c => c.id === watch('vendorId'));
                                if (bill) {
                                    generateVendorBillPDF(
                                        bill,
                                        vendor?.name || 'Vendor',
                                        watchLineItems.map((item) => ({
                                            productName: products.find(p => p.id === item.productId)?.name || 'Product',
                                            quantity: item.quantity,
                                            unitPrice: item.unitPrice
                                        }))
                                    );
                                }
                            }
                        }} leftIcon={<FileDown className="w-4 h-4" />}>Export PDF</Button>
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
                        options={contacts.filter((c: any) => c.type === "vendor" || c.contactType === "vendor" || c.type === "both" || c.contactType === "both").map((c: any) => ({
                            value: String(c.id),
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
                                                options={products.map((p: any) => ({
                                                    value: String(p.id),
                                                    label: p.name
                                                }))}
                                                value={watchLineItems[index]?.productId}
                                                onValueChange={(val) => {
                                                    const prod = products.find((p: any) => String(p.id) === val);
                                                    setValue(`lineItems.${index}.productId`, val);
                                                    if (prod) {
                                                        setValue(`lineItems.${index}.unitPrice`, (prod as any).purchasePrice || (prod as any).purchase_price || 0);
                                                    }
                                                }}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Select
                                                options={[
                                                    { value: "none", label: "None" },
                                                    ...analyticalAccounts.map((a: any) => ({
                                                        value: String(a.id),
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
