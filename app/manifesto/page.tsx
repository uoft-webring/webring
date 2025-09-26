import Manifesto from "./manifesto.mdx";

import "./manifesto.css";

export default function Page() {
    return (
        <section className="mx-auto mb-4 w-full max-w-[85rem]">
            <section className="mx-auto mt-8 w-full max-w-[45rem] px-4">
                <Manifesto />
            </section>
        </section>
    );
}
