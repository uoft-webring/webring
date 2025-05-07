"use client";

import React from "react";

export default function Switch({ switchValue, children }) {
    const childrenArray = React.Children.toArray(children);
    const desired = childrenArray.find((child) => {
        return child?.props?.caseValue === switchValue;
    });
    return desired;
}
