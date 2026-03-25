export const parseJwtPayload = (token) => {
    try {
        const base64Payload = token.split(".")[1];
        if (!base64Payload) return null;
        const jsonPayload = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
};

export const formatUserName = (raw) => {
    if (!raw) return "User";
    if (raw.includes("@")) {
        return raw.split("@")[0];
    }
    return raw;
};

export const getAuthUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = parseJwtPayload(token);
    const role = localStorage.getItem("role") || payload?.role || "";
    const storedName = localStorage.getItem("userName");
    const subjectName = payload?.sub || payload?.subject || "";
    const name = formatUserName(storedName || subjectName);

    return { name, role };
};

export const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
};

export const setStoredUserName = (value) => {
    if (!value) {
        localStorage.removeItem("userName");
        return;
    }
    localStorage.setItem("userName", value);
};
