import Manifesto from "./manifesto.mdx";

import "./manifesto.css";

export default function Page() {
    return (
        <section className="max-w-[85rem] w-full mx-auto mb-4">
            <section className="max-w-[45rem] w-full mx-auto px-4 mt-8">
                <Manifesto />
            </section>
        </section>
    );
}
