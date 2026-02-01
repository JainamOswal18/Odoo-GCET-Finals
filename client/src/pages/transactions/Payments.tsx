import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Home, ArrowLeft, Save, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Card, Select, Badge } from "@/components/ui";
import { paymentsApi, contactsApi, invoicesApi, billsApi } from "@/lib/api";

const paymentSchema = z.object({
    paymentType: z.enum(["send", "receive"], { message: "Payment type is required" }),
    partnerId: z.string().min(1, "Partner is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    paymentDate: z.string().min(1, "Payment date is required"),
    paymentMethod: z.enum(["cash", "bank", "upi", "razorpay", "cheque"], { message: "Payment method is required" }),
    referenceType: z.enum(["invoice", "bill"], { message: "Reference type is required" }),
    referenceId: z.string().min(1, "Reference invoice/bill is required").optional().or(z.literal("")),
    notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export const Payments: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [payments, setPayments] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState<"draft" | "confirmed" | "cancelled">("draft");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const [paymentsData, contactsData, invoicesData, billsData] = await Promise.all([
                paymentsApi.getAll(),
                contactsApi.getAll(),
                invoicesApi.getAll(),
                billsApi.getAll()
            ]);
            setPayments(paymentsData);
            setContacts(contactsData);
            setInvoices(invoicesData);
            setBills(billsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
            console.error('Error fetching payments data:', err);
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
    } = useForm<PaymentFormData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            paymentType: "receive",
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: "cash",
            referenceType: "invoice",
        },
    });

    const watchReferenceType = watch("referenceType");
    const watchReferenceId = watch("referenceId");

    // Auto-fill partner and amount when reference is selected
    React.useEffect(() => {
        if (watchReferenceId) {
            if (watchReferenceType === "invoice") {
                const selectedInvoice = invoices.find((i: any) => String(i.id) === String(watchReferenceId));
                if (selectedInvoice) {
                    const customer = contacts.find((c: any) => String(c.id) === String(selectedInvoice.customerId));
                    if (customer) {
                        setValue("partnerId", String(customer.id));
                    }
                    setValue("amount", selectedInvoice.amountDue || 0);
                }
            } else if (watchReferenceType === "bill") {
                const selectedBill = bills.find((b: any) => String(b.id) === String(watchReferenceId));
                if (selectedBill) {
                    const vendor = contacts.find((v: any) => String(v.id) === String(selectedBill.vendorId));
                    if (vendor) {
                        setValue("partnerId", String(vendor.id));
                    }
                    setValue("amount", selectedBill.amountDue || 0);
                }
            }
        }
    }, [watchReferenceId, watchReferenceType, setValue, invoices, bills, contacts]);

    const handleNew = () => {
        setView("form");
        setEditingId(null);
        setStatus("draft");
        reset({
            paymentType: "receive",
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: "cash",
            referenceType: "invoice",
        });
    };

    const handleEdit = (payment: any) => {
        setView("form");
        setEditingId(payment.id);
        setStatus(payment.status);
        reset({
            paymentType: payment.paymentType,
            partnerId: payment.partnerId ? String(payment.partnerId) : "",
            amount: payment.amount,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            referenceType: payment.referenceType || "invoice",
            referenceId: payment.referenceId ? String(payment.referenceId) : "",
            notes: payment.notes,
        });
    };

    const onSubmit = async (data: PaymentFormData) => {
        try {
            setLoading(true);
            setError(null);

            const payload = {
                payment_type: data.paymentType === 'receive' ? 'inbound' : 'outbound',
                contact_id: data.partnerId,
                payment_date: data.paymentDate,
                amount: data.amount,
                payment_method: data.paymentMethod,
                reference: data.referenceId,
                notes: data.notes || null,
            };

            if (editingId) {
                await paymentsApi.update(editingId, payload);
            } else {
                await paymentsApi.create(payload);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save payment');
            console.error('Error saving payment:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        setStatus("confirmed");
    };

    const handleCancel = () => {
        setStatus("cancelled");
    };

    const filteredPayments = payments.filter((payment) =>
        (payment.paymentNumber || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.partnerName || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.referenceNumber || payment.reference || '')?.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
                        <p className="text-gray-500">Record and manage payments for invoices and bills</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Payment
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search payments..."
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                            Filters
                        </Button>
                    </div>

                    {loading && payments.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Payment Number</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Partner</th>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Amount</th>
                                    <th className="px-4 py-3">Method</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPayments.map((payment) => (
                                    <tr
                                        key={payment.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(payment)}
                                    >
                                        <td className="px-4 py-3 font-medium text-indigo-600">
                                            {payment.paymentNumber}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${payment.paymentType === "receive"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {payment.paymentType === "receive" ? "Receive" : "Send"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-900">{payment.partnerName}</td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {payment.referenceNumber}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-gray-900">
                                            ₹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 capitalize">
                                            {payment.paymentMethod}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === "confirmed"
                                                    ? "bg-green-100 text-green-700"
                                                    : payment.status === "draft"
                                                        ? "bg-gray-100 text-gray-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {payment.status}
                                            </span>
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
                            {editingId ? "Edit" : "New"} Payment
                        </h1>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handleConfirm} disabled={status === "confirmed"}>
                        Confirm
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel} disabled={status === "cancelled"}>
                        Cancel
                    </Button>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editingId ?
                                            payments.find(p => p.id === editingId)?.paymentNumber :
                                            `PAY/25/${String(payments.length + 1).padStart(4, '0')}`
                                        }
                                        disabled
                                        className="w-full p-2 border rounded-lg bg-gray-50"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        (Auto-generated Payment Number)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Payment Type <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="send"
                                                {...register("paymentType")}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Send (for Bills)</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="receive"
                                                {...register("paymentType")}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Receive (for Invoices)</span>
                                        </label>
                                    </div>
                                    {errors.paymentType && (
                                        <p className="text-xs text-red-600 mt-1">{errors.paymentType.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reference Type <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={[
                                            { value: "invoice", label: "Customer Invoice" },
                                            { value: "bill", label: "Vendor Bill" },
                                        ]}
                                        value={watch("referenceType")}
                                        onValueChange={(val) => setValue("referenceType", val as "invoice" | "bill")}
                                    />
                                    {errors.referenceType && (
                                        <p className="text-xs text-red-600 mt-1">{errors.referenceType.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {watchReferenceType === "invoice" ? "Invoice" : "Bill"} <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={
                                            watchReferenceType === "invoice"
                                                ? invoices.map((i: any) => ({
                                                    value: String(i.id),
                                                    label: `${i.invoiceNumber} - ${i.customerName} (Due: ₹${(i.amountDue || 0).toLocaleString()})`
                                                }))
                                                : bills.map((b: any) => ({
                                                    value: String(b.id),
                                                    label: `${b.billNumber} - ${b.vendorName} (Due: ₹${(b.amountDue || 0).toLocaleString()})`
                                                }))
                                        }
                                        value={watch("referenceId")}
                                        onValueChange={(val) => setValue("referenceId", val)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select the invoice or bill this payment is for
                                    </p>
                                    {errors.referenceId && (
                                        <p className="text-xs text-red-600 mt-1">{errors.referenceId.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Partner <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={contacts.map((c: any) => ({
                                            value: String(c.id),
                                            label: c.name
                                        }))}
                                        value={watch("partnerId")}
                                        onValueChange={(val) => setValue("partnerId", val)}
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Auto-filled from {watchReferenceType === "invoice" ? "Invoice" : "Bill"}
                                    </p>
                                    {errors.partnerId && (
                                        <p className="text-xs text-red-600 mt-1">{errors.partnerId.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Amount <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full p-2 border rounded-lg"
                                            {...register("amount", { valueAsNumber: true })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Auto-filled from {watchReferenceType === "invoice" ? "Invoice" : "Bill"} due amount
                                        </p>
                                        {errors.amount && (
                                            <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Payment Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="w-full p-2 border rounded-lg"
                                            {...register("paymentDate")}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Default: Today's date</p>
                                        {errors.paymentDate && (
                                            <p className="text-xs text-red-600 mt-1">{errors.paymentDate.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Via <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        options={[
                                            { value: "cash", label: "Cash" },
                                            { value: "bank", label: "Bank Transfer" },
                                            { value: "upi", label: "UPI" },
                                            { value: "razorpay", label: "Razorpay" },
                                            { value: "cheque", label: "Cheque" },
                                        ]}
                                        value={watch("paymentMethod")}
                                        onValueChange={(val) => setValue("paymentMethod", val as "cash" | "bank" | "upi" | "razorpay" | "cheque")}
                                    />
                                    {errors.paymentMethod && (
                                        <p className="text-xs text-red-600 mt-1">{errors.paymentMethod.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Note (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Add any notes about this payment..."
                                        className="w-full p-2 border rounded-lg text-sm"
                                        {...register("notes")}
                                    />
                                </div>
                            </div>

                            <div className="ml-8">
                                <Badge
                                    variant={status === "confirmed" ? "success" : status === "cancelled" ? "danger" : "default"}
                                >
                                    {status === "draft" ? "Draft" : status === "confirmed" ? "Confirmed" : "Cancelled"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <Button variant="outline" type="button" onClick={() => setView("list")}>
                            Cancel
                        </Button>
                        <Button type="submit" leftIcon={<Save className="w-4 h-4" />}>
                            {editingId ? "Update" : "Create"} Payment
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
