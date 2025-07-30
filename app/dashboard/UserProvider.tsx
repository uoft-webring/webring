"use client";

import { createContext, useContext } from "react";
import { UserType } from "@/utils/zod";

const UserContext = createContext<UserType | null>(null);

export function UserProvider({
    user,
    children,
}: {
    user: UserType;
    children: React.ReactNode;
}) {
    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
    return ctx;
}
