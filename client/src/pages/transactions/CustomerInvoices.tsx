import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Plus, Search, Filter, Home, ArrowLeft, AlertTriangle, Loader2, FileDown } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, Select, Badge } from "@/components/ui";
import { invoicesApi, contactsApi, productsApi, analyticalAccountsApi } from "@/lib/api";
import { generateInvoicePDF } from "@/lib/pdfGenerator";
import type { CustomerInvoice } from "@/lib/types";

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
    analyticalAccountId: z.string().optional(),
});

const invoiceSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    reference: z.string().optional(),
    invoiceDate: z.string().min(1, "Invoice date is required"),
    dueDate: z.string().optional(),
    salesOrderId: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
    notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const CustomerInvoices: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [invoices, setInvoices] = useState<CustomerInvoice[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [analyticalAccounts, setAnalyticalAccounts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<"draft" | "confirmed" | "done" | "cancelled">("draft");
    const [showBudgetWarning, setShowBudgetWarning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const location = useLocation();

    useEffect(() => {
        fetchData();
    }, []);

    // Handle pre-populated data from Sales Order
    useEffect(() => {
        const state = location.state as any;
        if (state?.fromSO && state?.soData) {
            const so = state.soData;
            setView("form");
            setEditingId(null);
            setStatus("draft");
            
            // Pre-fill form with SO data
            setTimeout(() => {
                reset({
                    customerId: String(so.customerId),
                    salesOrderId: String(so.id),
                    invoiceDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    reference: so.orderNumber || so.soNumber,
                    lineItems: (so.lineItems || []).map((item: any) => ({
                        productId: String(item.productId),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        analyticalAccountId: item.analyticalAccountId ? String(item.analyticalAccountId) : "none",
                    })),
                    notes: `Created from SO: ${so.orderNumber || so.soNumber}`,
                });
            }, 100);
            
            // Clear location state to prevent re-triggering
            window.history.replaceState({}, document.title);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [invoicesData, contactsData, productsData, accountsData] = await Promise.all([
                invoicesApi.getAll(),
                contactsApi.getAll(),
                productsApi.getAll(),
                analyticalAccountsApi.getAll()
            ]);
            setInvoices(invoicesData as CustomerInvoice[]);
            setContacts(contactsData);
            setProducts(productsData);
            setAnalyticalAccounts(accountsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching customer invoices data:', err);
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
        trigger,
        formState: { errors },
    } = useForm<InvoiceFormData>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            customerId: "",
            invoiceDate: new Date().toISOString().split('T')[0],
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


    const handleNew = () => {
        setView("form");
        setEditingId(null);
        setStatus("draft");
        setShowBudgetWarning(false);
        reset({
            customerId: "",
            invoiceDate: new Date().toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "" }],
        });
    };

    const handleEdit = async (invoice: CustomerInvoice) => {
        try {
            const response: any = await invoicesApi.getById(invoice.id);
            const fullInvoice = response.invoice;
            const lines = response.lines || [];
            
            setView("form");
            setEditingId(fullInvoice.id);
            setStatus(fullInvoice.status);
            setShowBudgetWarning(false);
            reset({
                customerId: String(fullInvoice.customerId),
                reference: "",
                invoiceDate: fullInvoice.invoiceDate,
                dueDate: fullInvoice.dueDate,
                salesOrderId: fullInvoice.salesOrderId,
                lineItems: lines.map((item: any) => ({
                    productId: String(item.productId),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    analyticalAccountId: item.analyticalAccountId ? String(item.analyticalAccountId) : "none",
                })),
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch invoice details');
        }
    };

    const onSubmit = async (data: InvoiceFormData) => {
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
                customer_id: data.customerId,
                invoice_date: data.invoiceDate,
                due_date: data.dueDate,
                sales_order_id: data.salesOrderId || null,
                lines: lineItemsPayload,
                notes: data.notes,
            };

            if (editingId) {
                await invoicesApi.update(editingId, payload);
            } else {
                await invoicesApi.create(payload);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save invoice');
            console.error('Error saving invoice:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        const valid = await trigger();
        if (valid) {
            await handleSubmit(onSubmit)();
            setStatus("confirmed");
            setShowBudgetWarning(true);
        }
    };

    const handleCancel = () => {
        setStatus("cancelled");
    };

    const handleSave = async () => {
        await handleSubmit(onSubmit)();
    };

    const handlePay = (invoice: CustomerInvoice) => {
        console.log("Opening payment form for invoice:", invoice.invoiceNumber);
        // This would open the payment recording page
    };

    const filteredInvoices = invoices.filter((inv) =>
        (inv.invoiceNumber || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.customerName || '')?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        <h1 className="text-2xl font-bold text-gray-900">Customer Invoices</h1>
                        <p className="text-gray-500">Manage customer invoices and payments</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Invoice
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                            Filters
                        </Button>
                    </div>

                    {loading && invoices.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Invoice Number</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Invoice Date</th>
                                    <th className="px-4 py-3">Due Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3 text-right">Amount Due</th>
                                    <th className="px-4 py-3">Payment Status</th>
                                    <th className="px-4 py-3 rounded-tr-lg text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredInvoices.map((invoice) => (
                                    <tr
                                        key={invoice.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(invoice)}
                                    >
                                        <td className="px-4 py-3 font-medium text-indigo-600">
                                            {invoice.invoiceNumber}
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{invoice.customerName}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            ₹{(invoice.grandTotal || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-600">
                                            ₹{(invoice.amountDue || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.paymentStatus === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : invoice.paymentStatus === "partial"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {invoice.paymentStatus === "paid" ? "Paid" :
                                                    invoice.paymentStatus === "partial" ? "Partial" : "Not Paid"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {invoice.paymentStatus !== "paid" && invoice.status === "confirmed" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePay(invoice);
                                                    }}
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
                    )}
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" onClick={() => setView("list")} leftIcon={<Home className="w-4 h-4" />}>
                        Home
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setView("list")} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {editingId ? "Edit" : "New"} Customer Invoice
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleConfirm} disabled={status === "confirmed"}>
                        Confirm
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.print()}>Print</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                        if (editingId) {
                            const invoice = invoices.find(i => i.id === editingId);
                            const customer = contacts.find(c => c.id === watch('customerId'));
                            if (invoice) {
                                generateInvoicePDF(
                                    invoice,
                                    customer?.name || 'Customer',
                                    watchLineItems.map((item) => ({
                                        productName: products.find(p => p.id === item.productId)?.name || 'Product',
                                        quantity: item.quantity,
                                        unitPrice: item.unitPrice
                                    }))
                                );
                            }
                        }
                    }} leftIcon={<FileDown className="w-4 h-4" />}>Export PDF</Button>
                    <Button variant="outline" size="sm">Send</Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={status === "cancelled"}>
                        Cancel
                    </Button>
                    {status === "confirmed" && editingId && invoices.find(i => i.id === editingId)?.amountDue && invoices.find(i => i.id === editingId)!.amountDue > 0 && (
                        <Button variant="primary" size="sm" onClick={() => {
                            const invoice = invoices.find(i => i.id === editingId);
                            if (invoice) handlePay(invoice);
                        }}>
                            Pay
                        </Button>
                    )}
                    <Button variant="outline" size="sm">Budget</Button>
                </div>
            </div>

            {showBudgetWarning && status === "confirmed" && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-yellow-800">
                                Non Blocking Warning on Confirmation of Invoice
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

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Invoice Number
                                        </label>
                                        <input
                                            type="text"
                                            value={editingId ?
                                                invoices.find(i => i.id === editingId)?.invoiceNumber :
                                                `INV/2025/${String(invoices.length + 1).padStart(4, '0')}`
                                            }
                                            disabled
                                            className="w-full p-2 border rounded-lg bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            (Create Sequence → auto generate Invoice Number #  +(of last Invoice))
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer
                                        </label>
                                        <Select
                                            options={contacts.filter((c: any) => c.type === "customer" || c.contactType === "customer" || c.type === "both" || c.contactType === "both").map((c: any) => ({
                                                value: String(c.id),
                                                label: c.name
                                            }))}
                                            value={watch("customerId")}
                                            onValueChange={(val) => setValue("customerId", val)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            (from Contact Master - Many to one)
                                        </p>
                                        {errors.customerId && (
                                            <p className="text-xs text-red-600 mt-1">{errors.customerId.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Invoice Reference
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., SO-25-001"
                                            className="w-full p-2 border rounded-lg"
                                            {...register("reference")}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Alpha numeric (text)</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Invoice Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            {...register("invoiceDate")}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Date</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            {...register("dueDate")}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Date</p>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-8 flex flex-col items-end space-y-2">
                                <Badge
                                    variant={status === "confirmed" ? "success" : status === "cancelled" ? "danger" : "default"}
                                >
                                    {status === "draft" ? "Draft" : status === "confirmed" ? "Confirmed" : "Cancelled"}
                                </Badge>
                                {editingId && invoices.find(i => i.id === editingId)?.paymentStatus && (
                                    <Badge
                                        variant={
                                            invoices.find(i => i.id === editingId)?.paymentStatus === "paid"
                                                ? "success"
                                                : invoices.find(i => i.id === editingId)?.paymentStatus === "partial"
                                                    ? "warning"
                                                    : "danger"
                                        }
                                    >
                                        {invoices.find(i => i.id === editingId)?.paymentStatus === "paid"
                                            ? "Paid"
                                            : invoices.find(i => i.id === editingId)?.paymentStatus === "partial"
                                                ? "Partial"
                                                : "Not Paid"}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {editingId && invoices.find(i => i.id === editingId)?.salesOrderNumber && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                    📄 Created from Sales Order: <span className="font-semibold">
                                        {invoices.find(i => i.id === editingId)?.salesOrderNumber}
                                    </span>
                                </p>
                                <p className="text-xs text-blue-600 mt-1">on click</p>
                            </div>
                        )}

                        {editingId && invoices.find(i => i.id === editingId) && (
                            <div className="border-t border-b border-gray-200 py-4 space-y-2">
                                <div className="flex justify-end">
                                    <div className="text-right border-t-2 border-gray-300 pt-2">
                                        <p className="text-sm text-gray-600">Amount Due</p>
                                        <p className={`text-xl font-bold ${invoices.find(i => i.id === editingId)?.amountDue === 0
                                            ? 'text-green-600'
                                            : 'text-red-600'
                                            }`}>
                                            ₹{invoices.find(i => i.id === editingId)?.amountDue.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">(Total - Payment)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Line Items</h3>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-2 text-left w-12">Sr. No.</th>
                                        <th className="p-2 text-left w-48">
                                            <div className="flex items-center justify-between">
                                                <span>1</span>
                                                <span>Product</span>
                                            </div>
                                        </th>
                                        <th className="p-2 text-left w-48">
                                            <div className="flex items-center justify-between">
                                                <span>2</span>
                                                <span>Budget Analytics</span>
                                            </div>
                                        </th>
                                        <th className="p-2 text-center w-24">
                                            <div>3</div>
                                            <div>Qty</div>
                                        </th>
                                        <th className="p-2 text-right w-32">
                                            <div className="flex items-center justify-between">
                                                <span>4</span>
                                                <span>Unit Price</span>
                                            </div>
                                        </th>
                                        <th className="p-2 text-right w-32">Total</th>
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
                                                                setValue(`lineItems.${index}.unitPrice`, prod.salesPrice ?? prod.salePrice ?? 0);
                                                            }
                                                        }}
                                                    />
                                                    <p className="text-xs text-gray-500 mt-1">From Product Master - Many to one</p>
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
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {watchLineItems[index]?.analyticalAccountId
                                                            ? "From Analytical Master - Many to One"
                                                            : "Auto Generate From Auto Analytical Model (based on combination)"}
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
                                type="button"
                                onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, analyticalAccountId: "none" })}
                                leftIcon={<Plus className="w-4 h-4" />}
                            >
                                Add Line
                            </Button>
                            {fields.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    type="button"
                                    onClick={() => remove(fields.length - 1)}
                                >
                                    Remove Last Line
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Button variant="outline" type="button" onClick={() => setView("list")}>
                            Cancel
                        </Button>
                        <Button type="submit" leftIcon={<Plus className="w-4 h-4" />}>
                            {editingId ? "Update" : "Create"} Invoice
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
