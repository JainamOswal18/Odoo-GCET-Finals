import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { User, UserRole, AuthState } from "@/lib/types";
import { buildApiUrl, API_ENDPOINTS } from "@/lib/api";

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

    // ============================================================================
    // UNIFIED LOGIN - Auto-detects Admin or Portal user
    // ============================================================================
    const login = useCallback(async (loginId: string, password: string) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.login), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ loginId, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();
            const { token, user: userData } = data;

            // Transform API response to match our User type
            const user: User = {
                id: String(userData.id),
                name: userData.name,
                loginId: userData.loginId,
                email: userData.email,
                role: userData.role,
                contactId: userData.contact_id, // For portal users
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

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

    // ============================================================================
    // SIGNUP (Public signup is disabled - only admin can create users)
    // ============================================================================
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const signup = useCallback(async (_signupData: SignupData) => {
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            // Public signup is disabled - throw error
            throw new Error("Public signup is disabled. Please contact an administrator to create an account.");
        } catch (error) {
            setState((prev) => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    // ============================================================================
    // CREATE USER (Admin only - creates admin or portal users)
    // ============================================================================
    const createUser = useCallback(async (data: CreateUserData) => {
        const token = localStorage.getItem(TOKEN_KEY);

        if (!token) {
            throw new Error("Authentication required");
        }

        const response = await fetch(buildApiUrl(API_ENDPOINTS.auth.register), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                name: data.name,
                loginId: data.loginId,
                email: data.email,
                password: data.password,
                role: data.role,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
        }

        const result = await response.json();
        return result;
    }, []);

    // ============================================================================
    // LOGOUT
    // ============================================================================
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
