import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, UserRole, AuthState } from "@/lib/types";

interface AuthContextType extends AuthState {
    login: (loginId: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    createUser: (data: CreateUserData) => Promise<void>;
}

interface SignupData {
    name: string;
    loginId: string;
    email: string;
    password: string;
    role?: UserRole;
}

interface CreateUserData extends SignupData {
    role: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys
const TOKEN_KEY = "shiv_auth_token";
const USER_KEY = "shiv_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Initialize auth state from storage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                const user = JSON.parse(storedUser) as User;
                setState({
                    user,
                    token: storedToken,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } catch {
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } else {
            setState((prev) => ({ ...prev, isLoading: false }));
        }
    }, []);

    const login = useCallback(async (loginId: string, password: string) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            // TODO: Replace with actual API call
            // Simulating API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock validation
            if (loginId.trim().toLowerCase() === "admin" && password === "Admin@123") {
                const user: User = {
                    id: "1",
                    name: "Admin User",
                    loginId: "admin",
                    email: "admin@shivfurniture.com",
                    role: "admin",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                const token = "mock_token_admin";

                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else if (loginId.trim().toLowerCase() === "portal" && password === "Portal@123") {
                const user: User = {
                    id: "2",
                    name: "Portal User",
                    loginId: "portal",
                    email: "user@customer.com",
                    role: "portal",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                const token = "mock_token_portal";

                localStorage.setItem(TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                setState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                throw new Error("Invalid credentials");
            }
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const signup = useCallback(async (data: SignupData) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            // TODO: Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Mock signup
            const user: User = {
                id: crypto.randomUUID(),
                name: data.name,
                loginId: data.loginId,
                email: data.email,
                role: data.role || "portal", // Default to portal if not provided
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const token = `mock_token_${user.id}`;

            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));

            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    const createUser = useCallback(async (data: CreateUserData) => {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Admin creates user - in real app this would be an API call
        console.log("User created:", data);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                signup,
                logout,
                createUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
