import logo from "@/public/logo.svg";
import Link from "next/link";

export default function Logo() {
    return (
        <Link href="/">
            <div className="w-48 lg:w-60">
                <img
                    src={logo.src}
                    alt="Logo"
                    className="max-w-full max-h-full"
                />
            </div>
        </Link>
    );
}
