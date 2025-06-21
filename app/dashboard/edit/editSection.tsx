"use client";
import React, { useEffect, useState } from "react";
import EditForm from "./form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserType } from "@/utils/zod";
import { getCurrentUserDataForClient } from "../actions";
import ProfileCard from "@/components/profileCard";

export default function EditSection() {
    const [data, setData] = useState<UserType | null>(null);

    //* Fetching inside a useEffect.
    //* May God forgive me.

    useEffect(() => {
        async function fetchData() {
            // Simulate fetching data
            const result = await getCurrentUserDataForClient();
            setData(result);
        }
        fetchData();
    }, []);

    if (!data) {
        return <p>Loading...</p>; // or a loading spinner
    }

    return (
        <Tabs defaultValue="edit" className="w-full lg:hidden">
            <TabsList className="grid w-full grid-cols-2 mb-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
                <EditForm data={data} />
            </TabsContent>
            <TabsContent value="preview">
                <ProfileCard userData={data} />
            </TabsContent>
        </Tabs>
    );
}
