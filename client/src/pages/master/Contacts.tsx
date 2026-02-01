import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, Save, Archive, Upload, X, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input, Card, Select, ToastContainer } from "@/components/ui";
import type { ToastType } from "@/components/ui";
import { contactsApi } from "@/lib/api";
import type { Contact } from "@/lib/types";
import { getImageUrl } from "@/lib/utils";

// Schema matching the wireframe fields
const contactSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(1, "Phone is required"),
    type: z.enum(["portal", "admin"]),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    pincode: z.string().optional(),
    tags: z.array(z.string()).optional(),
    image: z.string().nullable().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const Contacts: React.FC = () => {
    const [view, setView] = useState<"list" | "form">("list");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"new" | "confirm" | "archived">("new");
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
    const navigate = useNavigate();

    const showToast = (message: string, type: ToastType) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    // Fetch contacts on mount
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await contactsApi.getAll();
            console.log('Fetched contacts:', data);
            console.log('First contact:', data[0]);
            setContacts(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch contacts');
            console.error('Error fetching contacts:', err);
        } finally {
            setLoading(false);
        }
    };

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
            type: "portal",
            tags: [],
        },
    });

    const watchedTags = watch("tags") || [];
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault(); // Always prevent form submission on Enter
            if (tagInput.trim()) {
                if (!watchedTags.includes(tagInput.trim())) {
                    setValue("tags", [...watchedTags, tagInput.trim()]);
                }
                setTagInput("");
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setValue(
            "tags",
            watchedTags.filter((tag) => tag !== tagToRemove)
        );
    };

    const onSubmit = async (data: ContactFormData) => {
        try {
            setLoading(true);
            setError(null);

            const userRole = data.type; // portal or admin
            const token = localStorage.getItem('shiv_auth_token');

            if (editingId) {
                // For update, use FormData to send to /contacts endpoint
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('email', data.email);
                formData.append('phone', data.phone || '');
                formData.append('contact_type', 'customer');
                if (data.address) formData.append('address', data.address);
                if (data.city) formData.append('city', data.city);
                if (data.state) formData.append('state', data.state);
                if (data.country) formData.append('country', data.country);
                if (data.pincode) formData.append('postal_code', data.pincode);
                if (data.tags && data.tags.length > 0) {
                    const tagsArray = Array.isArray(data.tags) ? data.tags : [];
                    formData.append('tags', JSON.stringify(tagsArray));
                }

                const imageInput = document.getElementById('image-upload') as HTMLInputElement;
                if (imageInput?.files?.[0]) {
                    formData.append('image', imageInput.files[0]);
                }

                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/contacts/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Update failed');
                }

                showToast('Contact updated successfully!', 'success');
            } else {
                // For create, use /register endpoint which creates both contact and user
                // Generate a proper loginId: sanitized name + timestamp suffix
                let sanitizedName = data.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                
                // Ensure minimum length of 6 characters
                if (sanitizedName.length < 3) {
                    sanitizedName = 'user' + sanitizedName;
                }
                
                // Add timestamp to ensure uniqueness
                const timestamp = Date.now().toString().slice(-6);
                const loginId = sanitizedName + timestamp;
                
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: data.name,
                        loginId: loginId,
                        email: data.email,
                        role: userRole,
                        sendCredentials: true
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    console.error('Register API error response:', error);
                    
                    // Extract detailed error message
                    let errorMessage = error.error || error.message || 'Failed to create user';
                    
                    // If there are validation details, show them
                    if (error.details && Array.isArray(error.details) && error.details.length > 0) {
                        const detailMessages = error.details.map((d: any) => d.msg || d.message).join(', ');
                        errorMessage = detailMessages || errorMessage;
                    }
                    
                    throw new Error(errorMessage);
                }

                const registerResult = await response.json();
                const contactId = registerResult.user?.contact_id;

                // Now update the contact with additional details including image
                if (contactId) {
                    const formData = new FormData();
                    formData.append('name', data.name);
                    formData.append('email', data.email);
                    formData.append('phone', data.phone || '');
                    formData.append('contact_type', 'customer');
                    if (data.address) formData.append('address', data.address);
                    if (data.city) formData.append('city', data.city);
                    if (data.state) formData.append('state', data.state);
                    if (data.country) formData.append('country', data.country);
                    if (data.pincode) formData.append('postal_code', data.pincode);
                    if (data.tags && data.tags.length > 0) {
                        const tagsArray = Array.isArray(data.tags) ? data.tags : [];
                        formData.append('tags', JSON.stringify(tagsArray));
                    }

                    // Handle image upload
                    const imageInput = document.getElementById('image-upload') as HTMLInputElement;
                    if (imageInput?.files?.[0]) {
                        formData.append('image', imageInput.files[0]);
                    }

                    const updateResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/contacts/${contactId}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!updateResponse.ok) {
                        console.warn('User created but contact update failed');
                    }
                }

                showToast(
                    `${userRole === 'admin' ? 'Admin' : 'Portal'} user created successfully! Login ID: ${loginId}. Credentials sent to ${data.email}`,
                    'success'
                );
            }

            await fetchContacts();
            setView("list");
            reset();
            setEditingId(null);
            setImagePreview(null);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to save contact';
            setError(errorMessage);
            console.error('Error saving contact:', err);
            showToast(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contact: Contact) => {
        setEditingId(contact.id);

        // Handle tags that might be string or array
        let tags = contact.tags || [];
        if (typeof tags === 'string') {
            try {
                tags = JSON.parse(tags);
            } catch (e) {
                tags = [];
            }
        }
        if (!Array.isArray(tags)) tags = [];

        // Get image URL using helper function
        const rawImageUrl = contact.image || contact.imageUrl || contact.companyLogoUrl;
        const imageUrl = getImageUrl(rawImageUrl);
        
        reset({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            type: "portal", // Default to portal when editing
            address: contact.address,
            city: contact.city,
            state: contact.state,
            country: contact.country,
            pincode: contact.pincode || contact.postalCode,
            tags: tags,
            image: imageUrl,
        });
        
        if (imageUrl) {
            setImagePreview(imageUrl);
        } else {
            setImagePreview(null);
        }
        
        setView("form");
    };

    const handleNew = () => {
        setEditingId(null);
        reset({ type: "portal", tags: [] });
        setView("form");
    };



    const handleArchive = async () => {
        if (!editingId) return;

        if (!confirm('Are you sure you want to archive this contact?')) {
            return;
        }

        try {
            setLoading(true);
            await contactsApi.archive(editingId);
            await fetchContacts();
            setView('list');
            setEditingId(null);
            reset();
        } catch (err: any) {
            setError(err.message || 'Failed to archive contact');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async () => {
        if (!editingId) return;

        if (!confirm('Are you sure you want to restore this contact?')) {
            return;
        }

        try {
            setLoading(true);
            await contactsApi.unarchive(editingId);
            await fetchContacts();
            setView('list');
            setEditingId(null);
            reset();
        } catch (err: any) {
            setError(err.message || 'Failed to restore contact');
        } finally {
            setLoading(false);
        }
    };

    // Filter contacts based on activeTab and search
    const filteredContacts = contacts.filter((contact) => {
        // Filter by active status based on tab
        // Convert to number to handle SQLite 0/1 or boolean true/false
        const isActive = Number(contact.active ?? 1); // Default to active if undefined
        const activeFilter = activeTab === 'archived' ? isActive === 0 : isActive === 1;

        // Filter by search term
        const searchFilter = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (contact.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

        return activeFilter && searchFilter;
    });

    if (view === "list") {
        return (
            <>
                <ToastContainer toasts={toasts} removeToast={removeToast} />
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
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Tabs for filtering */}
                    <div className="flex items-center space-x-1 mb-4 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'new'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab('archived')}
                            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'archived'
                                    ? 'border-indigo-600 text-indigo-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Archived
                        </button>
                    </div>

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

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    ) : filteredContacts.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            No contacts found. Click "New Contact" to create one.
                        </div>
                    ) : (
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
                                    {filteredContacts.map((contact) => {
                                        if (contact.name === 'ABC Suppliers Ltd') {
                                            console.log('ABC Supplier contact data:', contact);
                                            console.log('City:', contact.city);
                                            console.log('Postal Code:', contact.postalCode, contact.pincode);
                                        }
                                        return (
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
                                                        className={`px-2 py-1 rounded-full text-xs capitalize ${(contact.type || contact.contactType) === "vendor"
                                                            ? "bg-orange-100 text-orange-700"
                                                            : "bg-blue-100 text-blue-700"
                                                            }`}
                                                    >
                                                        {contact.type || contact.contactType}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {(() => {
                                                            // Handle tags that might be string or array
                                                            let tags = contact.tags;
                                                            if (typeof tags === 'string') {
                                                                try {
                                                                    tags = JSON.parse(tags);
                                                                } catch (e) {
                                                                    tags = [];
                                                                }
                                                            }
                                                            if (!Array.isArray(tags)) tags = [];

                                                            return (
                                                                <>
                                                                    {tags.slice(0, 2).map((tag, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                    {tags.length > 2 && (
                                                                        <span className="text-xs text-gray-400">
                                                                            +{tags.length - 2}
                                                                        </span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
            </>
        );
    }

    // Form View
    return (
        <>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className="space-y-6">

            {/* Header / Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-8">
                        <h1 className="text-xl font-bold text-gray-900">Contact Master</h1>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Home</Button>
                        <Button variant="ghost" size="sm" onClick={() => {
                            setView('list');
                            setEditingId(null);
                            reset();
                        }}>Back</Button>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-2">
                    </div>
                    <div className="flex items-center space-x-2">
                        {editingId && (
                            contacts.find(c => c.id === editingId)?.active ? (
                                <Button
                                    variant="outline"
                                    leftIcon={<Archive className="w-4 h-4" />}
                                    onClick={handleArchive}
                                    disabled={loading}
                                >
                                    Archive
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    leftIcon={<Archive className="w-4 h-4" />}
                                    onClick={handleRestore}
                                    disabled={loading}
                                >
                                    Unarchive
                                </Button>
                            )
                        )}
                    </div>
                </div>

            </div>
            {/* Main Form Content */}
            <Card className="p-8">
                <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
                    // Show first validation error as toast
                    const firstError = Object.values(validationErrors)[0]?.message;
                    if (firstError) {
                        showToast(firstError as string, 'error');
                    }
                })}>
                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <div className="mb-8">
                    <Input
                        placeholder="e.g. Azure Interior"
                        className="text-2xl font-semibold border-t-0 border-x-0 border-b-2 rounded-none px-2 focus:ring-0 focus:border-indigo-600"
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
                                    { value: "portal", label: "Portal User" },
                                    { value: "admin", label: "Admin" },
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
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <label
                            htmlFor="image-upload"
                            className="border-2 border-dashed border-pink-400 rounded-2xl p-8 flex flex-col items-center justify-center text-center h-64 hover:bg-pink-50/50 transition-colors cursor-pointer group bg-white"
                        >
                            {(imagePreview || watch('image')) ? (
                                <div className="relative w-full h-full">
                                    <img src={imagePreview || watch('image') || ''} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setImagePreview(null);
                                            setValue('image', '');
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-10 h-10 text-pink-500" />
                                    </div>
                                    <h3 className="font-semibold text-pink-600 mb-1 text-lg">Upload Image</h3>
                                    <p className="text-sm text-gray-500">
                                        Drag & drop or click to browse
                                    </p>
                                </>
                            )}
                        </label>
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        setImagePreview(reader.result as string);
                                        setValue('image', reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Save Button at Bottom */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setView('list');
                            reset();
                            setEditingId(null);
                            setImagePreview(null);
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        leftIcon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? 'Saving...' : (editingId ? 'Update' : 'Save')}
                    </Button>
                </div>
                </form>
            </Card>
        </div>
        </>
    );
};
