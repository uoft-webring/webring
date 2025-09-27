"use client";

import { TypeAnimation } from "react-type-animation";

const ExampleComponent = () => {
    return (
        <TypeAnimation
            sequence={[
                "We are re-writing the developer's story.",
                1000,
                "We are the difference they can't ignore.",
                1000,
                "We are the choice to stand out.",
                1000,
            ]}
            wrapper="h2"
            speed={50}
            style={{ display: "inline-block", fontSize: "2.25rem", fontWeight: "800" }}
            repeat={Infinity}
        />
    );
};

export default ExampleComponent;
