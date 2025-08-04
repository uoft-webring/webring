import { getAuthUser } from "@/app/dashboard/actions";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { UserProvider } from "./UserProvider";
import Stepper from "../../components/Stepper";
import { getAuthUserProfile } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: authUser, error: authError } = await getAuthUser();
    if (!authUser || authError) redirect("/signup");

    const { data: userData, error: userError } = await getAuthUserProfile();
    if (!userData || userError) {
        redirect("/signup");
    }

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
    return (
        <UserProvider user={userData}>
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar user={userData} />
                <section className="max-w-[70rem] mx-auto w-full px-6">
                    <h1 className="mb-4">{`Welcome, ${authUser.user_metadata.name}.`}</h1>
                </section>
                <div className="flex flex-col md:flex-row max-w-[70rem] mx-auto w-full flex-1  place-items-start">
                    <Stepper
                        steps={onboardingRoutes}
                        className="px-6 w-full md:w-min md:h-screen md:flex md:flex-col  mt-12 sm:mt-6"
                    />
                    <div className="max-w-[70rem] mx-auto w-full px-6 mt-12 sm:mt-6">{children}</div>
                </div>
            </div>
        </UserProvider>
    );
}
