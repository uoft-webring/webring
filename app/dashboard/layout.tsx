import { Navbar } from "@/components/Navbar";
import { Stepper } from "@/components/Stepper";
import { requireOwnProfile } from "@/lib/auth";

const ONBOARDING_STEPS = [
    { id: "edit", title: "Edit" },
    { id: "join", title: "Join" },
    { id: "verify", title: "Verify" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const profile = await requireOwnProfile();

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <Navbar user={profile} />
            <section className="mx-auto w-full max-w-[85rem] px-6">
                <h1 className="mb-4 capitalize">{`Welcome, ${profile.name}.`}</h1>
            </section>
            <div className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col place-items-start md:flex-row">
                <Stepper steps={ONBOARDING_STEPS} className="mt-6 w-full px-6 md:flex md:h-screen md:w-min md:flex-col" />
                <div className="mx-auto mt-12 mb-5 w-full max-w-[85rem] px-6 sm:mt-6">{children}</div>
                {/* On mobile, some space at the bottom feels better */}
                <div className="flex h-10 sm:hidden"></div>
            </div>
        </div>
    );
}
