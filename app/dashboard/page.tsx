import { redirect } from "next/navigation";
import { getCurrentUser, signOutAction } from "./actions";

export default async function Dashboard() {
    const user = await getCurrentUser();
    if (!user) {
        redirect("/join");
    }

    return (
        <div>
            <h1>hi this is the user dashboard</h1>
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
