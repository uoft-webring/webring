import Image from "next/image";
import Link from "next/link";
import { BookOpenText, ChartColumn, Contact, House, LayoutDashboard, LogOut, Palette, User } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PublicProfile } from "@/lib/profiles/types";
import { profilePath } from "@/lib/site";
import logo from "@/public/logo.svg";
import { Avatar } from "./Avatar";
import { Button } from "./ui/button";

// Order is intentional; "My Page" depends on the user's slug
const menuLinks = (slug: string) => [
    { href: "/", label: "Home", icon: House },
    { href: "/dashboard/edit", label: "Edit Profile", icon: LayoutDashboard },
    { href: profilePath(slug), label: "My Page", icon: User },
    { href: "/dashboard/page", label: "Customize Page", icon: Palette },
    { href: "/dashboard/stats", label: "My Stats", icon: ChartColumn },
    { href: "/directory", label: "Directory", icon: Contact },
    { href: "/manifesto", label: "Manifesto", icon: BookOpenText },
];

const itemClass = "cursor-pointer rounded-lg px-3 py-2.5";

export function Navbar({
    user,
    authAction = "signup",
}: {
    user?: PublicProfile | null;
    authAction?: "signin" | "signup";
}): React.JSX.Element {
    return (
        <nav className="z-999 flex w-full max-w-[85rem] items-center justify-between self-center px-6 py-4">
            <Link href="/" className="w-48 lg:w-60">
                <Image priority width={240} height={60} src={logo} alt="UofT Webring Logo" className="max-h-full max-w-full" />
            </Link>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none focus:outline-none" aria-label="Account menu">
                        <Avatar profile={user} className="w-12" verifiedSize="size-5" size={48} priority />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[10rem] rounded-xl p-2">
                        {menuLinks(user.slug).map(({ href, label, icon: Icon }) => (
                            <DropdownMenuItem key={href} asChild className={itemClass}>
                                <Link href={href}>
                                    <Icon className="mr-2 h-4 w-4" aria-hidden />
                                    {label}
                                </Link>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <form action={signOut}>
                            <DropdownMenuItem asChild className={itemClass}>
                                <button type="submit" className="w-full">
                                    <LogOut className="mr-2 h-4 w-4" aria-hidden />
                                    Sign Out
                                </button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Button asChild>
                    <Link href={authAction === "signin" ? "/signin" : "/signup"}>
                        {authAction === "signin" ? "Sign in" : "Sign up"}
                    </Link>
                </Button>
            )}
        </nav>
    );
}
