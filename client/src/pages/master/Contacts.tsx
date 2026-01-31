import React, { useState } from "react";
import { Plus, Search, Filter, ArrowLeft, Save, Archive, Upload, X, UserPlus, Key } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select, PasswordInput } from "@/components/ui";
import { MOCK_CONTACTS } from "@/lib/mock";
import type { Contact } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

// Schema matching the wireframe fields
const contactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    type: z.enum(["customer", "vendor", "both"]),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const Contacts: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Portal Access Modal State
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [accessLoading, setAccessLoading] = useState(false);
    const { createUser } = useAuth();

    const [accessForm, setAccessForm] = useState({
        loginId: "",
        password: "",
        confirmPassword: ""
    });

    // Form setup
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            type: "customer",
            tags: [],
        },
    });

    const watchedTags = watch("tags") || [];
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!watchedTags.includes(tagInput.trim())) {
                setValue("tags", [...watchedTags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue(
            "tags",
            watchedTags.filter((tag) => tag !== tagToRemove)
        );
    };

    const onSubmit = (data: ContactFormData) => {
        if (editingId) {
            setContacts((prev) =>
                prev.map((c) =>
                    c.id === editingId
                        ? { ...c, ...data, updatedAt: new Date().toISOString() }
                        : c
                )
            );
        } else {
            const newContact: Contact = {
                id: crypto.randomUUID(),
                ...data,
                isActive: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            setContacts((prev) => [...prev, newContact]);
        }
        setView("list");
        reset();
        setEditingId(null);
    };

    const handleEdit = (contact: Contact) => {
        setEditingId(contact.id);
        reset({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            type: contact.type,
            address: contact.address,
            city: contact.city,
            state: contact.state,
            country: contact.country,
            pincode: contact.pincode,
            tags: contact.tags || [],
            image: contact.image,
        });
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ type: "customer", tags: [] });
        setView("form");
    };

    const filteredContacts = contacts.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "list") {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contacts/Partners</h1>
                        <p className="text-gray-500">Manage customers and vendors</p>
                    </div>
                    <Button onClick={handleNew} leftIcon={<Plus className="w-4 h-4" />}>
                        New Contact
                    </Button>
                </div>

                <Card className="p-4">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
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
                                    <th className="px-4 py-3 rounded-tl-lg">Name</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">City</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 rounded-tr-lg">Tags</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredContacts.map((contact) => (
                                    <tr
                                        key={contact.id}
                                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => handleEdit(contact)}
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {contact.name}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">{contact.phone}</td>
                                        <td className="px-4 py-3 text-gray-500">{contact.email}</td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {contact.city || "-"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs capitalize ${contact.type === "vendor"
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "bg-blue-100 text-blue-700"
                                                    }`}
                                            >
                                                {contact.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {contact.tags?.slice(0, 2).map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {contact.tags && contact.tags.length > 2 && (
                                                    <span className="text-xs text-gray-400">
                                                        +{contact.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
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

            {/* Grant Access Modal (Simplified Implementation) */}
            {
                isAccessModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <Card className="w-full max-w-md p-6 bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                                    <Key className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Grant Portal Access</h3>
                                    <p className="text-sm text-gray-500">Create credentials for {watch("name")}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Login ID"
                                    placeholder="e.g. user_123"
                                    value={accessForm.loginId}
                                    onChange={(e) => setAccessForm(prev => ({ ...prev, loginId: e.target.value }))}
                                />
                                <PasswordInput
                                    label="Password"
                                    placeholder="Min 8 chars"
                                    value={accessForm.password}
                                    onChange={(e) => setAccessForm(prev => ({ ...prev, password: e.target.value }))}
                                />
                                <PasswordInput
                                    label="Confirm Password"
                                    placeholder="Confirm password"
                                    value={accessForm.confirmPassword}
                                    onChange={(e) => setAccessForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                />

                                <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                                    ℹ️ Credentials will be sent to <strong>{watch("email") || "the registered email"}</strong>.
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        className="flex-1"
                                        isLoading={accessLoading}
                                        onClick={async () => {
                                            if (accessForm.password !== accessForm.confirmPassword) {
                                                alert("Passwords do not match!");
                                                return;
                                            }
                                            if (!accessForm.loginId || !accessForm.password) {
                                                alert("Please fill all fields");
                                                return;
                                            }

                                            setAccessLoading(true);
                                            try {
                                                await createUser({
                                                    name: watch("name"),
                                                    email: watch("email") || "",
                                                    loginId: accessForm.loginId,
                                                    password: accessForm.password,
                                                    role: "portal"
                                                });
                                                alert(`Success! Credentials sent to ${watch("email")}`);
                                                setIsAccessModalOpen(false);
                                                setAccessForm({ loginId: "", password: "", confirmPassword: "" });
                                            } catch (e) {
                                                alert(e instanceof Error ? e.message : "Failed to create user");
                                            } finally {
                                                setAccessLoading(false);
                                            }
                                        }}
                                    >
                                        Create & Send
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsAccessModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* Header / Actions */}
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
                        {editingId ? "Edit Contact" : "New Contact"}
                    </h1>
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="secondary"
                        leftIcon={<UserPlus className="w-4 h-4" />}
                        onClick={() => {
                            if (!watch("email")) {
                                alert("Please enter an email address first.");
                                return;
                            }
                            setIsAccessModalOpen(true);
                        }}
                    >
                        Grant Portal Access
                    </Button>
                    <div className="h-6 w-px bg-gray-300 mx-2" />
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

            {/* Main Form Content */}
            <Card className="p-8">
                <div className="mb-8">
                    <Input
                        placeholder="e.g. Azure Interior"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-0 focus:ring-0 focus:border-indigo-600 px-2"
                        label="Contact Name"
                        error={errors.name?.message}
                        {...register("name")}
                    />
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column: Details */}
                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Email"
                                placeholder="unique email"
                                error={errors.email?.message}
                                {...register("email")}
                            />
                            <Input
                                label="Phone"
                                placeholder="Integer"
                                error={errors.phone?.message}
                                {...register("phone")}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Select
                                label="Type"
                                options={[
                                    { value: "customer", label: "Customer" },
                                    { value: "vendor", label: "Vendor" },
                                    { value: "both", label: "Both" },
                                ]}
                                value={watch("type")}
                                onValueChange={(val) => setValue("type", val as any)}
                            />
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="font-medium text-gray-900">Address</h3>
                            <Input
                                placeholder="Street"
                                error={errors.address?.message}
                                {...register("address")}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="City"
                                    error={errors.city?.message}
                                    {...register("city")}
                                />
                                <Input
                                    placeholder="State"
                                    error={errors.state?.message}
                                    {...register("state")}
                                />
                                <Input
                                    placeholder="Country"
                                    error={errors.country?.message}
                                    {...register("country")}
                                />
                                <Input
                                    placeholder="Pincode"
                                    error={errors.pincode?.message}
                                    {...register("pincode")}
                                />
                            </div>
                        </div>

                        {/* Tags Input */}
                        <div className="pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {watchedTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-1 hover:text-indigo-900"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <Input
                                placeholder="Type tag and hit Enter (e.g. B2B, Retailer)"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                *Tags can be created on the fly
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Image Upload */}
                    <div className="w-full lg:w-64 flex-shrink-0">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-64 hover:bg-gray-50 transition-colors cursor-pointer group bg-gray-50/50">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-indigo-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">Upload Image</h3>
                            <p className="text-xs text-gray-500">
                                Drag info here or click to browse
                            </p>
                        </div>
                    </div>
                </div>
            </Card>
        </div >
    );
};
