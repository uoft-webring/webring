import Navbar from "@/components/Navbar";
import { getAllUserProfiles, getAuthUserProfile } from "../actions";
import { ProfileProvider } from "./ProfileProvider";

// Helper to make a sorted unique string array
const uniqueSorter = (arr: (string | number | null | undefined)[]) =>
    Array.from(
        new Set(
            arr
                .filter((x) => x !== null && x !== undefined)
                .map((x) => String(x).trim())
                .filter(Boolean)
        )
    ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

export default async function DirectoryLayout({ children }: { children: React.ReactNode }) {
    const { data: userData } = await getAuthUserProfile();
    const { data: ringProfiles, error: ringProfilesError } = await getAllUserProfiles();

    if (!ringProfiles || ringProfilesError) {
        console.error("[Directory] Error fetching profiles:", ringProfilesError);
        return <p>Error loading profiles.</p>;
    }

    // Precompute filter metrics on the server for faster client filtering
    const tags = uniqueSorter(ringProfiles.flatMap((p: any) => (Array.isArray(p.tags) ? p.tags : [])));

    const programs = uniqueSorter(
        ringProfiles.flatMap((p: any) =>
            Array.isArray(p.programs) ? p.programs : p.program ? [String(p.program)] : []
        )
    );

    const graduationYears = uniqueSorter(
        ringProfiles.map(
            (p: any) => p.graduation_year ?? p.graduationYear ?? p.grad_year ?? p.gradYear ?? null
        )
    );

    const filterMetrics = {
        tags,
        programs,
        "Graduation Years": graduationYears,
    } as const;

    return (
        <ProfileProvider profiles={ringProfiles as any} filterMetrics={filterMetrics as any}>
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar user={userData} />
                {children}
            </div>
        </ProfileProvider>
    );
}
