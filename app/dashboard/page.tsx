import { redirect } from "next/navigation";
import { getCurrentUser, getUserInfo, signOutAction } from "./actions";

export default async function Dashboard() {
    const user = await getCurrentUser();
    const name = await getUserInfo();
    if (!user) {
        redirect("/signup");
    }

    return (
        <div>
            <h1>Welcome {name}</h1>
            <pre className="bg-gray-700 border rounded text-xs max-h-32 max-w-64 overflow-auto">
                {JSON.stringify(user, null, 2)}
            </pre>
            <form action={signOutAction}>
                <button className="border cursor-pointer" type="submit">
                    sign out
                </button>
            </form>
        </div>
    );
}
