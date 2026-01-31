import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { KeyRound, ArrowLeft, Mail } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";

const forgotPasswordSchema = z.object({
    email: z.string().min(1, "Email is required").email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        setError(null);

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));
            console.log("Password reset email sent to:", data.email);
            setIsSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Decorative Elements */}
            <div className="absolute top-40 left-40 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
            <div className="absolute bottom-40 right-40 w-64 h-64 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-lg">
                    {!isSubmitted ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mb-4">
                                    <KeyRound className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                                <p className="text-gray-500 mt-2">
                                    No worries! Enter your email and we'll send you reset instructions.
                                </p>
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

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="Enter your registered email"
                                    error={errors.email?.message}
                                    leftIcon={<Mail className="w-5 h-5" />}
                                    {...register("email")}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    size="lg"
                                    isLoading={isLoading}
                                >
                                    Send Reset Link
                                </Button>
                            </form>

                            {/* Back to Login */}
                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-6">
                                <Mail className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                            <p className="text-gray-500 mb-6">
                                We've sent a password reset link to
                                <br />
                                <strong className="text-gray-700">{getValues("email")}</strong>
                            </p>
                            <p className="text-sm text-gray-400 mb-6">
                                Didn't receive the email? Check your spam folder or try again.
                            </p>
                            <div className="space-y-3">
                                <Button
                                    variant="secondary"
                                    className="w-full"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Try another email
                                </Button>
                                <Link to="/login">
                                    <Button variant="ghost" className="w-full">
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};
