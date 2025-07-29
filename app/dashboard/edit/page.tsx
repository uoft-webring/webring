"use client";
import React, { useEffect, useState } from "react";
import EditForm from "./Form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserType } from "@/utils/zod";
import { getCurrentUserDataForClient } from "../actions";
import ProfileCard from "@/components/ProfileCard";

export default function Edit() {
    const [data, setData] = useState<UserType | null>(null);

    //* Fetching inside a useEffect.
    //* May God forgive me.

    // TODO-J fetch data use state
    useEffect(() => {
        async function fetchData() {
            // Simulate fetching data
            //! FIX: THERE ARE THREE LEVELS OF CLIENT FETCHING
            const result = await getCurrentUserDataForClient();
            setData(result);
        }
        fetchData();
    }, []);

    if (!data) {
        return <p>Loading...</p>; // or a loading spinner
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
                    <p className="mb-6">
                        Complete the information below to complete your profile.
                    </p>
                    <EditForm formData={data} setFormData={setData} />
                </TabsContent>
                <TabsContent value="preview">
                    <h2>Preview</h2>
                    <p className="mb-6">
                        Preview your profile live, as you make changes.
                    </p>
                    <ProfileCard userData={data} />
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
                    <p className="mb-6 lg:text-base">
                        Preview your profile live, as you make changes.
                    </p>
                    <ProfileCard userData={data} />
                </div>
            </section>
        </>
    );
}
