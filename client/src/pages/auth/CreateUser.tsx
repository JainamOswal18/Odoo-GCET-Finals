import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button, Input, PasswordInput, Card, Select } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/lib/types";

const createUserSchema = z
    .object({
        name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
        role: z.enum(["admin", "portal"], { message: "Role is required" }),
        loginId: z
            .string()
            .min(1, "Login ID is required")
            .min(6, "Login ID must be 6-12 characters")
            .max(12, "Login ID must be 6-12 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Login ID can only contain letters, numbers, and underscores"),
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
        email: z.string().min(1, "Email is required").email("Please enter a valid email"),
        confirmPassword: z.string().min(1, "Please confirm the password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type CreateUserFormData = z.infer<typeof createUserSchema>;

export const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createUser, user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: searchParams.get("name") || "",
            email: searchParams.get("email") || "",
            role: "portal", // Default to portal
        }
    });

    const selectedRole = watch("role");

    const onSubmit = async (data: CreateUserFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await createUser({
                name: data.name,
                loginId: data.loginId,
                email: data.email,
                password: data.password,
                role: data.role as UserRole,
            });
            setSuccess(true);
            reset();
            setTimeout(() => setSuccess(false), 3000);

            // If coming from contacts, maybe offer to go back?
            // For now, just stay here.
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create user. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Only admins can access this page
    if (user?.role !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-500 mb-4">Only administrators can create new users.</p>
                    <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl"
            >
                <Card className="p-8 md:p-10 border-gray-200 shadow-xl bg-white/95 backdrop-blur">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
                        <p className="text-gray-500 mt-2">Enter user details and assign specific roles</p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-sm">
                            User created successfully!
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Row 1: Name & Role */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                            <Input
                                label="Name"
                                placeholder="Enter full name"
                                error={errors.name?.message}
                                {...register("name")}
                            />
                            <Select
                                label="Role"
                                placeholder="Select role"
                                options={[
                                    { value: "admin", label: "Admin" },
                                    { value: "portal", label: "Portal" },
                                ]}
                                value={selectedRole}
                                onValueChange={(value) => setValue("role", value as "admin" | "portal")}
                                error={errors.role?.message}
                            />
                        </div>

                        {/* Row 2: Login ID & Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                            <Input
                                label="Login id"
                                placeholder="6-12 characters"
                                error={errors.loginId?.message}
                                {...register("loginId")}
                            />
                            <PasswordInput
                                label="Password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register("password")}
                            />
                        </div>

                        {/* Row 3: Email ID & Re-Enter Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
                            <Input
                                label="Email id"
                                type="email"
                                placeholder="email@example.com"
                                error={errors.email?.message}
                                {...register("email")}
                            />
                            <PasswordInput
                                label="Re-Enter password"
                                placeholder="••••••••"
                                error={errors.confirmPassword?.message}
                                {...register("confirmPassword")}
                            />
                        </div>

                        {/* Role Info & Actions */}
                        <div className="pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-gray-100 mt-8">
                            <div className="text-sm text-gray-500 max-w-md">
                                <p><strong>Admin:</strong> All access rights.</p>
                                <p><strong>Portal:</strong> View own invoices/orders/bills only.</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="submit"
                                    size="lg"
                                    isLoading={isLoading}
                                    className="min-w-[120px]"
                                >
                                    Create
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="min-w-[120px]"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
};
