import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard/actions";
import { User } from "@supabase/supabase-js";
import Logo from "./Logo";
import Image from "next/image";
import Link from "next/link";

type NavbarProps = {
    user: User | null;
    imageData: any;
} & React.ComponentPropsWithoutRef<"nav">;

export default function Navbar({ user, imageData }: NavbarProps) {
    const userData = imageData;
    const fallbackSrc = `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${userData?.ring_id}&radius=50`;
    const imageSrc = userData?.image_url || fallbackSrc;

    return (
        <nav className="max-w-[85rem] w-full px-6 py-4 flex justify-between items-center self-center z-999">
            <Logo />
            {user ? (
                <div className="flex flex-row items-center justify-around gap-4">
                    <Button variant={"outline"} onClick={signOutAction}>
                        Sign out
                    </Button>
                    <Link href="/dashboard">
                        <Image
                            width={32}
                            height={32}
                            src={imageSrc}
                            className="rounded-full w-14 aspect-square border-4 border-card outline-4 outline-white"
                            alt="Profile picture"
                        />
                    </Link>
                </div>
            ) : (
                <Link href={"/signup"}>
                    <Button>Sign up</Button>
                </Link>
            )}
        </nav>
    );
}
