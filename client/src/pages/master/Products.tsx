import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Save, Archive, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select } from "@/components/ui";
import { productsApi } from "@/lib/api";
import type { Product } from "@/lib/types";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    salesPrice: z.number().min(0, "Sales price must be positive"),
    purchasePrice: z.number().min(0, "Purchase price must be positive"),
    description: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export const Products: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [products, setProducts] = useState<Product[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("new");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productsApi.getAll();
            console.log('Products fetched:', data);
            setProducts(data);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    // Setup categories (mock list + dynamic)
    const [categories, setCategories] = useState([
        "Office Furniture",
        "Raw Material",
        "Services",
        "Electronics"
    ]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            category: "Office Furniture",
            salesPrice: 0,
            purchasePrice: 0,
        },
    });

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategory, setNewCategory] = useState("");

    const handleCreateCategory = () => {
        if (newCategory.trim()) {
            setCategories([...categories, newCategory.trim()]);
            setValue("category", newCategory.trim());
            setNewCategory("");
            setIsCreatingCategory(false);
        }
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            setLoading(true);
            setError(null);
            
            if (editingId) {
                await productsApi.update(editingId, data);
            } else {
                await productsApi.create(data);
            }
            
            await fetchProducts();
            setView("list");
            reset();
            setEditingId(null);
        } catch (err: any) {
            setError(err.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product.id);
        reset({
            name: product.name,
            category: product.category,
            salesPrice: product.salesPrice,
            purchasePrice: product.purchasePrice,
            description: product.description,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ category: "Office Furniture", salesPrice: 0, purchasePrice: 0 });
        setView("form");
    };

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
                        <p className="text-gray-500">Manage products and services</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Product
                    </Button>
                </div>

                <Card className="p-4">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" leftIcon={<Filter className="w-4 h-4" />}>
                            Filters
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-gray-500">Loading products...</div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No products found. Click "New Product" to create one.
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 font-medium">
                                <tr>
                                    <th className="px-4 py-3 rounded-tl-lg">Product Name</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Sales Price</th>
                                    <th className="px-4 py-3 text-right">Cost Price</th>
                                    <th className="px-4 py-3 rounded-tr-lg">SKU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredProducts.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(product)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-violet-50 text-violet-700 rounded-full text-xs">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900 font-medium">
                                            ₹{(product.salesPrice || product.salePrice || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-500">
                                            ₹{(product.purchasePrice || product.costPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                                            {product.sku || product.internalReference || '-'}
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
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold text-gray-900">Product Master</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setView('list')}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => setView('list')}>Back</Button>
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
                        placeholder="Product Name"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-2 focus:ring-0 focus:border-indigo-600"
                        label="Product Name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        {/* Category with Create New logic */}
                        {isCreatingCategory ? (
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter new category"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        autoFocus
                                    />
                                    <Button onClick={handleCreateCategory} size="sm">Add</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setIsCreatingCategory(false)}><X className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Select
                                    label="Category"
                                    options={[
                                        ...categories.map(c => ({ value: c, label: c })),
                                        { value: "create_new", label: "+ Create New Category" }
                                    ]}
                                    value={watch("category")}
                                    onValueChange={(val) => {
                                        if (val === "create_new") {
                                            setIsCreatingCategory(true);
                                        } else {
                                            setValue("category", val);
                                        }
                                    }}
                                    error={errors.category?.message}
                                />
                                <p className="text-xs text-gray-500">*Category can be created on the fly</p>
                            </div>
                        )}

                        <div className="pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                            <textarea
                                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                placeholder="Product description..."
                                {...register("description")}
                            />
                        </div>
                    </div>

                    <div className="space-y-6 bg-gray-50/50 p-6 rounded-xl border border-gray-100 h-fit">
                        <Input
                            label="Sales Price"
                            type="number"
                            rightIcon={<span className="text-gray-500 text-sm font-medium">₹</span>}
                            error={errors.salesPrice?.message}
                            {...register("salesPrice", { valueAsNumber: true })}
                        />
                        <Input
                            label="Purchase Price"
                            type="number"
                            rightIcon={<span className="text-gray-500 text-sm font-medium">₹</span>}
                            error={errors.purchasePrice?.message}
                            {...register("purchasePrice", { valueAsNumber: true })}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
};
