import { getAuthUser } from "@/app/dashboard/actions";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserProvider } from "./UserProvider";
import Stepper from "../../components/Stepper";
import { getAuthUserProfile } from "../actions";

const onboardingRoutes = [
    {
        id: "edit",
        title: "Edit",
        description: "Edit your profile",
    },
    {
        id: "join",
        title: "Join",
        description: "Join the webring",
    },
    {
        id: "verify",
        title: "Verify",
        description: "Verify your membership",
    },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: authUser, error: authError } = await getAuthUser();
    if (!authUser || authError) redirect("/signup");

    const { data: userData, error: userError } = await getAuthUserProfile();
    if (!userData || userError) {
        redirect("/signup");
    }

    return (
        <UserProvider user={userData}>
            <div className="bg-background flex min-h-screen flex-col">
                <Navbar user={userData} />
                <section className="mx-auto w-full max-w-[85rem] px-6">
                    <h1 className="mb-4 capitalize">{`Welcome, ${authUser.user_metadata.name}.`}</h1>
                </section>
                <div className="mx-auto flex w-full max-w-[85rem] flex-1 flex-col place-items-start md:flex-row">
                    <Stepper
                        steps={onboardingRoutes}
                        className="mt-6 w-full px-6 md:flex md:h-screen md:w-min md:flex-col"
                    />
                    <div className="mx-auto mt-12 mb-5 w-full max-w-[85rem] px-6 sm:mt-6">{children}</div>
                    {/* On mobile, some space at the bottom feels better */}
                    <div className="flex h-10 sm:hidden"></div>
                </div>
            </div>
        </UserProvider>
    );
}
