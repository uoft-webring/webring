import { redirect } from "next/navigation";
import { getCurrentUser, getUserInfo, signOutAction } from "./actions";
import Navbar from "@/components/navbar";
import StatusCard from "@/components/statusCard";
import ProfileCard from "@/components/profileCard";
import { Button } from "@/components/ui/button";

import { ChevronRight, Dot as SeparatorIcon } from "lucide-react";
import Link from "next/link";
import EditProfile from "../edit/components/profile";
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import EditJoin from "../edit/components/join";
import EditVerify from "../edit/components/verify";
import { cn } from "@/lib/utils";

const NAVIGATION_LINKS = [
    { id: "#preview", name: "Preview" },
    { id: "#edit", name: "Edit" },
    { id: "#join", name: "Join" },
    { id: "#verify", name: "Verify" },
];

export default async function Dashboard() {
    const { user: authUser, error: authError } = await getCurrentUser();

    if (!authUser) {
        // console.log(authError);
        redirect("/signup");
    }

    const { data: userData, error: userError } = await getUserInfo();

    // console.log(authUser);
    // console.log(userData);

    return (
        <>
            <Navbar />
            <div className="section -my-4">
                <Breadcrumb>
                    <BreadcrumbList className="justify-center">
                        {/* <BreadcrumbItem>
                            <BreadcrumbLink href="/">Preview</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>
                            <SeparatorIcon />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/components">
                                Components
                            </BreadcrumbLink>
                        </BreadcrumbItem> */}
                        {NAVIGATION_LINKS.map((linkItem, index) => (
                            <>
                                {index !== 0 && (
                                    <BreadcrumbSeparator>
                                        <SeparatorIcon />
                                    </BreadcrumbSeparator>
                                )}
                                <BreadcrumbItem>
                                    <BreadcrumbLink href={linkItem.id}>
                                        {linkItem.name}
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                            </>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            <div className="section flex flex-col gap-2">
                <h1 className="mb-4">{`Welcome, ${
                    authUser.user_metadata.name ?? userData
                }.`}</h1>
                {/* Status card */}

                <div>
                    <div className="flex justify-between items-center">
                        <h2>Status</h2>
                        {/* <Link href="/edit">
                            <div className="flex items-center justify-center">
                                <p className="text-white text-base">Edit</p>
                                <ChevronRight size={20} className="ml-1" />
                            </div>
                        </Link> */}
                    </div>
                    <StatusCard status="connected" />
                </div>

                {/* <Button variant={"secondary"}>Edit</Button> */}
                {/* Preview profile */}
                <div>
                    <h2>Preview</h2>
                    <ProfileCard userData={userData} />
                </div>
            </div>

            <section className="section" id="edit">
                <EditProfile data={userData} />
            </section>

            <section className="section" id="join">
                <EditJoin />
            </section>

            <section className={cn("section", "pt-0")} id="verify">
                <EditVerify domainTxtRecord={"uoft-webring-" + authUser.id} />
            </section>
        </>
    );

    // return (
    //     <div>
    //         <h1>Welcome {name}</h1>
    //         <pre className="bg-gray-700 border rounded text-xs max-h-32 max-w-64 overflow-auto">
    //             {JSON.stringify(user, null, 2)}
    //         </pre>
    //         <form action={signOutAction}>
    //             <button className="border cursor-pointer" type="submit">
    //                 sign out
    //             </button>
    //         </form>
    //     </div>
    // );
}
