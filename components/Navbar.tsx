import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard/actions";
import Link from "next/link";
import FallbackImage from "./FallbackImage";
import logo from "@/public/logo.svg";
import { UserType } from "@/utils/zod";
import Image from "next/image";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar({
    user,
}: {
    user?: UserType | null;
} & React.ComponentPropsWithoutRef<"nav">) {
    return (
        <nav className="max-w-[85rem] w-full px-6 py-4 flex justify-between items-center self-center z-999">
            <Link href="/" className="w-48 lg:w-60">
                <Image
                    priority
                    width={240}
                    height={60}
                    src={logo.src}
                    alt="UofT Webring Logo"
                    className="max-w-full max-h-full"
                />
            </Link>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none focus:outline-none">
                        <FallbackImage
                            width={64}
                            height={64}
                            src={user.image_url}
                            seed={user.ring_id}
                            alt={user.name + "'s Profile picture"}
                            className="rounded-full w-14 aspect-square border-4 border-card outline-2 outline-white"
                        />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="text-md">
                        <Link href="/">
                            <DropdownMenuItem>Home</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard">
                            <DropdownMenuItem>Dashboard</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOutAction}>Sign out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Link prefetch={true} href={"/signup"}>
                    <Button>Sign up</Button>
                </Link>
            )}
        </nav>
    );
}
