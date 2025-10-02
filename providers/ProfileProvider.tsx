"use client";
import { createContext, useContext } from "react";
import type { SafeUserType } from "@/utils/zod";

export type DirectoryContextValue = {
    profiles: SafeUserType[];
    filterMetrics: Record<string, string[]>;
};

const DirectoryContext = createContext<DirectoryContextValue | null>(null);

export function ProfileProvider({
    profiles,
    filterMetrics,
    children,
}: {
    profiles: SafeUserType[];
    filterMetrics: Record<string, string[]>;
    children: React.ReactNode;
}) {
    return (
        <DirectoryContext.Provider value={{ profiles, filterMetrics }}>{children}</DirectoryContext.Provider>
    );
}

export function useProfiles() {
    const ctx = useContext(DirectoryContext);
    if (!ctx) throw new Error("useProfiles must be used inside <ProfileProvider>");
    return ctx;
}
