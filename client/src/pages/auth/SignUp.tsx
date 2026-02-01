import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Shield, ArrowRight } from "lucide-react";
import { Button, Input, PasswordInput, Card } from "@/components/ui";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api";

const signupSchema = z
    .object({
        name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
        loginId: z
            .string()
            .min(1, "Login ID is required")
            .min(6, "Login ID must be 6-12 characters")
            .max(12, "Login ID must be 6-12 characters")
            .regex(/^[a-zA-Z0-9_]+$/, "Login ID can only contain letters, numbers, and underscores"),
        email: z.string().min(1, "Email is required").email("Please enter a valid email"),
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Password must be at least 8 characters")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type SignupFormData = z.infer<typeof signupSchema>;

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.signup), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    loginId: data.loginId,
                    email: data.email,
                    password: data.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Signup failed');
            }

            setSuccess(true);
            
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Decorative Elements */}
            <div className="absolute top-20 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-lg">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Sign Up as Admin</h1>
                        <p className="text-gray-500 mt-2">Create an administrator account</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg"
                        >
                            <p className="text-sm text-red-600">{error}</p>
                        </motion.div>
                    )}

                    {/* Success Message */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg"
                        >
                            <p className="text-sm text-green-600">
                                Admin account created successfully! Redirecting to login...
                            </p>
                        </motion.div>
                    )}

                    {/* Signup Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="Enter your full name"
                            error={errors.name?.message}
                            disabled={success}
                            {...register("name")}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Login ID"
                                placeholder="6-12 characters"
                                error={errors.loginId?.message}
                                disabled={success}
                                {...register("loginId")}
                            />
                            <Input
                                label="Email"
                                type="email"
                                placeholder="your@email.com"
                                error={errors.email?.message}
                                disabled={success}
                                {...register("email")}
                            />
                        </div>

                        <PasswordInput
                            label="Password"
                            placeholder="Min 8 chars, 1 upper, 1 special"
                            error={errors.password?.message}
                            disabled={success}
                            {...register("password")}
                        />

                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Re-enter your password"
                            error={errors.confirmPassword?.message}
                            disabled={success}
                            {...register("confirmPassword")}
                        />

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                            disabled={success}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            {success ? "Account Created!" : "Create Admin Account"}
                        </Button>
                    </form>

                    {/* Password Requirements */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-1">Password Requirements:</p>
                        <ul className="text-xs text-gray-500 space-y-0.5">
                            <li>• At least 8 characters</li>
                            <li>• One uppercase letter (A-Z)</li>
                            <li>• One lowercase letter (a-z)</li>
                            <li>• One special character (!@#$...)</li>
                        </ul>
                    </div>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
