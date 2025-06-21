import React from "react";
import { Button } from "./ui/button";
import { signOutAction } from "@/app/dashboard-2/actions";

export default function Navbar() {
    return (
        <div className="w-full h-16 flex items-center justify-between px-4">
            <div className="bg-[#222] w-32 h-12"></div>
            <Button variant={"outline"} onClick={signOutAction}>
                Sign out
            </Button>
        </div>
    );
}
