import { ProfileEditor } from "@/components/profile-editor/ProfileEditor";
import { requireOwnProfile } from "@/lib/auth";

export default async function EditPage() {
    // Same cached read as the dashboard layout: no extra query
    const profile = await requireOwnProfile();
    return <ProfileEditor initialProfile={profile} />;
}
