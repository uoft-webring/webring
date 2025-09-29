import Image from "next/image";
import Link from "next/link";
import gitHubIcon from "@/icons/gitHub.svg";

export default function Footer() {
    return (
        <footer className="text-md mx-auto flex w-full max-w-[85rem] flex-col items-center justify-center gap-4 px-6 py-6 sm:flex-row sm:justify-between sm:gap-0">
            <div className="hidden sm:flex">&copy; 2025 | UofT Webring</div>

            <div className="flex items-center gap-4">
                <Link href="/redirect?nav=prev&id=0" className="text-2xl">
                    ←
                </Link>

                <Link href="/">
                    <Image
                        src="./ring_logo.svg"
                        width={30}
                        height={30}
                        alt="UofT Webring"
                        className="h-auto w-8"
                    />
                </Link>

                <Link href="/redirect?nav=next&id=0" className="text-2xl">
                    →
                </Link>
            </div>

            <Link href="https://github.com/uoft-webring/webring" className="flex items-center gap-2">
                <p className="text-md hidden sm:flex">View on GitHub</p>
                <Image src={gitHubIcon} alt="GitHub" width={35} height={35} className="w-7 sm:hidden" />
            </Link>
        </footer>
    );
}
