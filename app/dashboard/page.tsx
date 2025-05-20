import { redirect } from "next/navigation";
import { getCurrentUser, getUserInfo, signOutAction } from "./actions";
import Navbar from "@/components/navbar";
import StatusCard from "@/components/statusCard";
import ProfileCard from "@/components/profileCard";

export default async function Dashboard() {
    const authUser = await getCurrentUser();
    const userData = await getUserInfo();

    if (!authUser) {
        redirect("/signup");
    }

    return (
        <>
            <Navbar />
            <div className="section flex flex-col gap-2">
                <h1 className="mb-4">{`Welcome, ${
                    authUser.user_metadata.name ?? userData.user?.name
                }.`}</h1>
                {/* Status card */}
                <div>
                    <h2>Status</h2>
                    <StatusCard status="connected" />
                </div>

                {/* Preview profile */}
                <div>
                    <h2>Preview</h2>
                    <ProfileCard />
                </div>
            </div>
        </>
    );

    // return (
    //     <div>
    //         <h1>Welcome {name}</h1>
    //         <pre className="bg-gray-700 border rounded text-xs max-h-32 max-w-64 overflow-auto">
    //             {JSON.stringify(user, null, 2)}
    //         </pre>
    //         <form action={signOutAction}>
    //             <button className="border cursor-pointer" type="submit">
    //                 sign out
    //             </button>
    //         </form>
    //     </div>
    // );
}
