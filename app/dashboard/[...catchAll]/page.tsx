export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

// Catch all garbage routes and trigger a 404
export default function DashboardCatchAll() {
    notFound();
}
