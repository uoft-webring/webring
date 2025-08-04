import Link from "next/link";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
            <h2>Not Found</h2>
            <p className="text-lg">What's worse is, we couldn't even find a 404 page either.</p>
            <Link href="/" className="mt-4 text-blue-500 hover:underline">
                Go back to home
            </Link>
        </div>
    );
}
