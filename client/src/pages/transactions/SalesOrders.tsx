import React, { useState, useEffect } from "react";
import { Plus, Save, FileText } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { salesOrdersApi, contactsApi, productsApi } from "@/lib/api";
import type { SalesOrder } from "@/lib/types";

const lineItemSchema = z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.number().min(0, "Price must be positive"),
});

const salesOrderSchema = z.object({
    customerId: z.string().min(1, "Customer is required"),
    reference: z.string().optional(),
    orderDate: z.string().min(1, "Order date is required"),
    expectedDate: z.string().optional(),
    lineItems: z.array(lineItemSchema).min(1, "At least one line item required"),
    notes: z.string().optional(),
});

type SOFormData = z.infer<typeof salesOrderSchema>;

export const SalesOrders: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [orders, setOrders] = useState<SalesOrder[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [status, setStatus] = useState<"draft" | "confirmed" | "done" | "cancelled">("draft");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, contactsData, productsData] = await Promise.all([
                salesOrdersApi.getAll(),
                contactsApi.getAll(),
                productsApi.getAll()
            ]);
            setOrders(ordersData as SalesOrder[]);
            setContacts(contactsData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch data');
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
    } = useForm<SOFormData>({
        resolver: zodResolver(salesOrderSchema),
        defaultValues: {
            customerId: "",
            orderDate: new Date().toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0 }],
        },
    });

    const { fields, append } = useFieldArray({
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

    const onSubmit = async (data: SOFormData) => {
        try {
            setLoading(true);
            setError(null);

            const lineItemsPayload = data.lineItems.map((item) => ({
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: item.unitPrice,
            }));

            const payload = {
                customer_id: data.customerId,
                order_date: data.orderDate,
                expected_date: data.expectedDate || null,
                status: status,
                notes: data.notes || null,
                lines: lineItemsPayload,
            };

            if (editingId) {
                await salesOrdersApi.update(editingId, payload);
            } else {
                await salesOrdersApi.create(payload);
            }

            await fetchData();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save sales order');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (order: SalesOrder) => {
        try {
            // Fetch full order details with line items
            const response: any = await salesOrdersApi.getById(order.id);
            const fullOrder = response.salesOrder;
            const lines = response.lines || [];
            
            setEditingId(fullOrder.id);
            setStatus(fullOrder.status);
            reset({
                customerId: String(fullOrder.customerId),
                orderDate: fullOrder.orderDate,
                expectedDate: fullOrder.expectedDate,
                lineItems: lines.map((item: any) => ({
                    productId: String(item.productId),
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                notes: fullOrder.notes,
            });
            setView("form");
        } catch (err: any) {
            setError(err.message || 'Failed to fetch order details');
        }
    };

    const handleNew = () => {
        setEditingId(null);
        setStatus("draft");
        reset({
            customerId: "",
            orderDate: new Date().toISOString().split('T')[0],
            lineItems: [{ productId: "", quantity: 1, unitPrice: 0 }],
        });
        setView("form");
    };

    const handleConfirm = () => {
        handleSubmit((data) => {
            onSubmit(data);
            setStatus("confirmed");
        })();
    };

    const handleCancel = () => {
        setStatus("cancelled");
    };

    const handleSave = () => {
        handleSubmit(onSubmit)();
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
                        <p className="text-gray-500">Manage customer sales orders</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New SO
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3">SO Number</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((so) => (
                                    <tr 
                                        key={so.id} 
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleEdit(so)}
                                    >
                                        <td className="px-4 py-3 font-medium text-indigo-600">{so.orderNumber || so.soNumber}</td>
                                        <td className="px-4 py-3">{so.customerName}</td>
                                        <td className="px-4 py-3">{new Date(so.orderDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right">₹{(so.grandTotal || so.totalAmount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">{so.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Button size="sm" variant="outline" leftIcon={<FileText className="w-3 h-3" />}>
                                                Create Invoice
                                            </Button>
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
            <div className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-4">
                        <Button variant="ghost" size="sm" onClick={() => setView("list")}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => setView("list")}>Back</Button>
                        <h1 className="text-xl font-bold">Sales Order</h1>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className={status === "draft" ? "bg-gray-100" : ""} onClick={() => setStatus("draft")}>Draft</Button>
                        <Button variant="ghost" size="sm" className={status === "confirmed" ? "bg-pink-100" : ""} onClick={() => setStatus("confirmed")}>Confirm</Button>
                        <Button variant="ghost" size="sm" className={status === "cancelled" ? "bg-gray-100" : ""} onClick={() => setStatus("cancelled")}>Cancelled</Button>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button onClick={handleSave} leftIcon={<Save className="w-4 h-4" />} disabled={loading}>Save</Button>
                    <Button onClick={handleConfirm} disabled={status === "confirmed" || loading}>Confirm</Button>
                    <Button variant="outline" onClick={() => window.print()}>Print</Button>
                    <Button variant="outline">Send</Button>
                    <Button variant="outline" onClick={handleCancel} disabled={status === "cancelled"}>Cancel</Button>
                    {status === "confirmed" && (
                        <Button variant="secondary" leftIcon={<FileText className="w-4 h-4" />} onClick={() => {
                            alert("Create Invoice functionality - will navigate to Customer Invoices page");
                        }}>
                            Create Invoice
                        </Button>
                    )}
                </div>
            </div>

            <Card className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">SO No.</label>
                        <div className="text-lg font-semibold text-indigo-600">SO{String(orders.length + 1).padStart(4, '0')}</div>
                    </div>
                    <Input label="SO Date" type="date" {...register("orderDate")} />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <Select
                        label="Customer Name"
                        options={contacts.filter(c => (c.type === "customer" || c.type === "both") || (c.contactType === "customer" || c.contactType === "both")).map(c => ({
                            value: String(c.id),
                            label: c.name
                        }))}
                        value={watch("customerId")}
                        onValueChange={(val) => setValue("customerId", val)}
                        error={errors.customerId?.message}
                    />
                    <Input label="Reference" {...register("reference")} />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2">
                                <th className="p-2 text-left">Sr. No.</th>
                                <th className="p-2 text-left">Product</th>
                                <th className="p-2 text-center">Qty</th>
                                <th className="p-2 text-center">Unit Price</th>
                                <th className="p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fields.map((field, index) => (
                                <tr key={field.id} className="border-b">
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">
                                        <Select
                                            options={products.map(p => ({ value: String(p.id), label: p.name }))}
                                            value={watchLineItems[index]?.productId}
                                            onValueChange={(val) => {
                                                const prod = products.find(p => String(p.id) === val);
                                                setValue(`lineItems.${index}.productId`, val);
                                                if (prod) setValue(`lineItems.${index}.unitPrice`, prod.salesPrice);
                                            }}
                                        />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-20 p-1 border rounded text-center" {...register(`lineItems.${index}.quantity`, { valueAsNumber: true })} />
                                    </td>
                                    <td className="p-2">
                                        <input type="number" className="w-24 p-1 border rounded text-right" {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} />
                                    </td>
                                    <td className="p-2 text-right font-medium">
                                        ₹{calculateLineTotal(watchLineItems[index]?.quantity || 0, watchLineItems[index]?.unitPrice || 0).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2">
                                <td colSpan={4} className="p-3 text-right font-semibold">Total</td>
                                <td className="p-3 text-right font-bold text-lg">₹{grandTotal.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <Button variant="outline" size="sm" className="mt-4" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0 })} leftIcon={<Plus className="w-4 h-4" />}>
                    Add Line
                </Button>
            </Card>
        </div>
    );
};
