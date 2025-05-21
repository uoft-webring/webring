import { redirect } from "next/navigation";
import { getCurrentUser, getUserInfo, signOutAction } from "./actions";
import Navbar from "@/components/navbar";
import StatusCard from "@/components/statusCard";
import ProfileCard from "@/components/profileCard";
import { Button } from "@/components/ui/button";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function Dashboard() {
    const { user: authUser, error: authError } = await getCurrentUser();
    const userData = await getUserInfo();

    if (!authUser) {
        console.log(authError);
        redirect("/signup");
    }

    console.log(authUser);
    console.log(userData);

    return (
        <>
            <Navbar />
            <div className="section flex flex-col gap-2">
                <h1 className="mb-4">{`Welcome, ${
                    authUser.user_metadata.name ?? userData.user?.name
                }.`}</h1>
                {/* Status card */}

                <div>
                    <div className="flex justify-between items-center">
                        <h2>Status</h2>
                        <Link href="/edit">
                            <div className="flex items-center justify-center">
                                <p className="text-white text-base">Edit</p>
                                <ChevronRight size={20} className="ml-1" />
                            </div>
                        </Link>
                    </div>
                    <StatusCard status="connected" />
                    <StatusCard status="unverified" />
                    <StatusCard status="disconnected" />
                </div>

                {/* <Button variant={"secondary"}>Edit</Button> */}
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
