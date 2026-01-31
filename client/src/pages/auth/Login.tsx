import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { LogIn, ArrowRight } from "lucide-react";
import { Button, Input, PasswordInput, Card } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

const loginSchema = z.object({
    loginId: z
        .string()
        .min(1, "Login ID is required")
        .min(5, "Login ID must be at least 5 characters")
        .max(12, "Login ID must be at most 12 characters"),
    password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            await login(data.loginId, data.password);
            navigate("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Decorative Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
            <div className="absolute bottom-20 right-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-lg">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
                            <LogIn className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
                        <p className="text-gray-500 mt-2">Sign in to Shiv Furniture ERP</p>
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

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <Input
                            label="Login ID"
                            placeholder="Enter your login ID"
                            error={errors.loginId?.message}
                            {...register("loginId")}
                        />

                        <PasswordInput
                            label="Password"
                            placeholder="Enter your password"
                            error={errors.password?.message}
                            {...register("password")}
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-gray-600">Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                            rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div> */}

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 mb-2">Demo Credentials:</p>
                        <div className="space-y-1 text-xs text-gray-600">
                            <p><strong>Admin:</strong> admin / Admin@123</p>
                            <p><strong>Portal:</strong> portal / Portal@123</p>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
