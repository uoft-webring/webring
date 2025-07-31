import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard/actions";
import Link from "next/link";
import FallbackImage from "./FallbackImage";
import logo from "@/public/logo.svg";
import { UserType } from "@/utils/zod";
import Image from "next/image";

type NavbarProps = {
    user: UserType | null;
    imageData: string;
} & React.ComponentPropsWithoutRef<"nav">;

export default function Navbar({ user, imageData }: NavbarProps) {
    return (
        <nav className="max-w-[85rem] w-full px-6 py-4 flex justify-between items-center self-center z-999">
            <Link href="/" className="w-48 lg:w-60">
                <Image
                    priority
                    width={240}
                    height={60}
                    src={logo.src}
                    alt="Logo"
                    className="max-w-full max-h-full"
                />
            </Link>
            {user ? (
                <div className="flex flex-row items-center justify-around gap-4">
                    <Button variant={"outline"} onClick={signOutAction}>
                        Sign out
                    </Button>
                    <Link href="/dashboard">
                        <FallbackImage
                            width={16}
                            height={16}
                            src={imageData}
                            ringId={user.ring_id}
                            alt="Profile picture"
                            className="rounded-2xl w-14 aspect-square border-1 border-card outline-2 outline-white"
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
