import { redirect } from "next/navigation";
import { getCurrentUser, getUserInfo, signOutAction } from "./actions";
import Navbar from "@/components/navbar";
import StatusCard from "@/components/statusCard";

export default async function Dashboard() {
    const user = await getCurrentUser();
    // const name = await getUserInfo();
    if (!user) {
        redirect("/signup");
    }

    return (
        <>
            <Navbar />
            <div className="section">
                <h1>{`Welcome, ${user.user_metadata.name}.`}</h1>
                <StatusCard status="connected" />
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
