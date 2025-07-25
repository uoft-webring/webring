import React from "react";
import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard/actions";
import Logo from "./Logo";

export default function Navbar() {
    return (
        <div className="w-full h-16 flex items-center justify-between px-4">
            <Logo />
            <Button variant={"outline"} onClick={signOutAction}>
                Sign out
            </Button>
        </div>
    );
}
