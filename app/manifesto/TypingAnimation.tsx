"use client";

import { TypeAnimation } from "react-type-animation";

const ExampleComponent = () => {
    return (
        <TypeAnimation
            sequence={[
                // Same substring at the start will only be typed out once, initially
                "We are for the builders with soul.",
                1000, // wait 1s before replacing "Mice" with "Hamsters"
                "We are where code becomes character.",
                1000,
                "We are the developer's rebellion.",
                1000,
            ]}
            wrapper="p"
            speed={50}
            style={{ display: "inline-block" }}
            repeat={Infinity}
        />
    );
};

export default ExampleComponent;
