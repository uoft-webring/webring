"use client";
import { useState } from "react";
import EditForm from "./Form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserType } from "@/utils/zod";
import ProfileCard from "@/components/ProfileCard";
import { useUser } from "../UserProvider";

export default function Edit() {
    const user = useUser();
    const [data, setData] = useState<UserType | null>(user);

    if (!data) {
        return null;
    }

    return (
        <>
            <Tabs defaultValue="edit" className="w-full lg:hidden">
                <TabsList className="grid w-full grid-cols-2 mb-2">
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                    <h2>Edit your profile</h2>
                    <p className="mb-6">Complete the information below to complete your profile.</p>
                    <EditForm formData={data} setFormData={setData} />
                </TabsContent>
                <TabsContent value="preview">
                    <h2>Preview</h2>
                    <p className="mb-6">Preview your profile live, as you make changes.</p>
                    <ProfileCard user={data} />
                </TabsContent>
            </Tabs>
            <section className="hidden lg:flex items-start justify-center gap-12 [&>*]:grow [&>*]:shrink [&>*]:basis-0">
                <div>
                    <h2>Edit your profile</h2>
                    <p className="mb-6 lg:text-base">
                        Complete the information below to complete your profile.
                    </p>
                    <EditForm formData={data} setFormData={setData} />
                </div>
                <div>
                    <h2>Preview</h2>
                    <p className="mb-6 lg:text-base">Preview your profile live, as you make changes.</p>
                    <ProfileCard user={data} />
                </div>
            </section>
        </>
    );
}
