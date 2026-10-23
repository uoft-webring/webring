import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { Navbar } from "@/components/Navbar";
import { requireOwnProfile } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const profile = await requireOwnProfile();

    const steps = [
        {
            id: "edit",
            title: "Edit",
            hint: "Your profile card",
            done: Boolean(profile.domain && profile.graduationYear && profile.program),
        },
        { id: "join", title: "Join", hint: "Add the ring widget", done: profile.ringStatus === "connected" },
        { id: "verify", title: "Verify", hint: "Prove you own your domain", done: profile.isVerified },
    ];

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={profile} />
            <div className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col gap-6 px-6 pt-4 pb-16 md:flex-row md:gap-10">
                <aside className="flex flex-col gap-5 md:sticky md:top-6 md:-ml-3 md:w-56 md:shrink-0 md:self-start lg:w-64">
                    <p className="flex flex-col md:px-3">
                        <span className="text-muted-foreground text-base">Welcome,</span>
                        <span className="truncate text-xl leading-tight font-semibold capitalize">{`${profile.name}.`}</span>
                    </p>
                    <DashboardNav steps={steps} />
                </aside>
                <div className="min-w-0 flex-1">{children}</div>
            </div>
        </div>
    );
}
