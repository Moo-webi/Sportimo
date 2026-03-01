import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (data) => {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setUser({ role: data.role });
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (token && role) {
            setUser({ role });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};