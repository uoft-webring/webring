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
import verifiedIcon from "@/icons/verified.svg";
import { cn } from "@/lib/utils";
import { House, LayoutDashboard, LogOut } from "lucide-react";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";

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
                    <DropdownMenuTrigger
                        className={cn(
                            "outline-none focus:outline-none"
                            // user.is_verified && "bg-popover rounded-t-full border-x"
                        )}
                    >
                        <div className="w-14 aspect-square rounded-full relative">
                            <FallbackImage
                                src={user.image_url}
                                seed={user.ring_id}
                                alt={user.name + "'s Profile picture"}
                                className={cn(
                                    "rounded-full w-14 aspect-square object-cover pointer-events-none drag-none select-none",
                                    user.is_verified && "border-1 border-white"
                                )}
                            />
                            {user.is_verified && (
                                <Image
                                    src={verifiedIcon}
                                    alt="Verified"
                                    className="absolute right-0 bottom-0 size-4"
                                />
                            )}
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="min-w-14 rounded-full border-t-0 py-2"
                        align="center"
                        sideOffset={10}
                    >
                        <Link href="/" className="flex mb-2" title="Home">
                            <DropdownMenuItem className="mx-auto">
                                <House className="size-6" />
                            </DropdownMenuItem>
                        </Link>

                        <Link href="/dashboard" className="flex mb-2" title="Dashboard">
                            <DropdownMenuItem className="mx-auto">
                                <LayoutDashboard className="size-6" />
                            </DropdownMenuItem>
                        </Link>

                        <div className="flex" title="Sign out">
                            <DropdownMenuItem className="mx-auto" onClick={signOutAction}>
                                <LogOut className="size-6" />
                            </DropdownMenuItem>
                        </div>
                        {/* <DropdownMenuArrow className="fill-popover" /> */}
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
