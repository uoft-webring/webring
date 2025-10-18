import { redirect } from "next/navigation";

export default function DashboardCatchAll() {
    redirect("/dashboard/edit");
}
