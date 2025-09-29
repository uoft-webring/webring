import { permanentRedirect } from "next/navigation";

export default function Dashboard() {
    permanentRedirect("/dashboard/edit");
}
