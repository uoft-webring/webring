import posthog from "posthog-js";

export const posthogIdentifyUser = ({
    userId,
    email,
    name,
}: {
    userId: string;
    email: string;
    name: string;
}) => {
    posthog.identify(userId, { email, name });
};
