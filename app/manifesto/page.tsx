import Navbar from "@/components/Navbar";
import Manifesto from "./manifesto.mdx";

import "./manifesto.css";

export default function Page() {
    return (
        <>
            <section className="max-w-[85rem] w-full mx-auto">
                <Navbar />
                <div className="px-4">
                    <Manifesto />
                </div>
            </section>
        </>
    );
}
