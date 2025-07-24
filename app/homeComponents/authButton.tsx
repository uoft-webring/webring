import { getCurrentUser, signOutAction } from "../dashboard/actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuthButton() {
    const { user, error } = await getCurrentUser();

    if (user) {
        return (
            <Button variant={"outline"} onClick={signOutAction}>
                Sign out
            </Button>
        );
    } else {
        return (
            <Link href={"/signup"}>
                <Button>Sign up</Button>
            </Link>
        );
    }
}
