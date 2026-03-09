import { useState } from "react";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        return token && role ? { role } : null;
    });

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setUser({ role: data.role });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
