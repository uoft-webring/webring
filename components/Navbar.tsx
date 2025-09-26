import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard/actions";
import Link from "next/link";
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
import Avatar from "./Avatar";
import { BookOpenText, Contact, Home, LayoutDashboard, LogOut, User } from "lucide-react";

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
                        <Avatar user={user} className="w-12" verifiedSize="size-6" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="text-md rounded-xl">
                        <Link href="/">
                            <DropdownMenuItem>
                                <Home className="mr-2 h-4 w-4" />
                                Home
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href="/dashboard" prefetch={true}>
                            <DropdownMenuItem>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Dashboard
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/u/[slug]" as={`/u/${user.slug}`}>
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <Link href="/directory" prefetch={false}>
                            <DropdownMenuItem>
                                <Contact className="mr-2 h-4 w-4" />
                                Directory
                            </DropdownMenuItem>
                        </Link>
                        <Link href="/manifesto">
                            <DropdownMenuItem>
                                <BookOpenText className="mr-2 h-4 w-4" />
                                Manifesto
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOutAction}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign Out
                        </DropdownMenuItem>
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
