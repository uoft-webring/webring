"use client";
import { useState } from "react";
import { joinAction, isEmailRegistered } from "./actions";

export default function FormStepOne({ email, setEmail, incrementFormStep }) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
        <div className="w-[32em]">
            <form className="flex flex-col">
                <label>UofT Email:</label>
                <input
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                    }}
                    name="email"
                    placeholder="youremail@example.com"
                    className="border"
                    required
                />
                <button
                    disabled={isDisabled}
                    className={`border my-1 ${
                        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                    } hover:bg-red-400`}
                    type="submit"
                    onClick={async () => {
                        // add checks for email
                        console.log("hi disabled");
                        setIsDisabled(() => true);

                        await joinAction(email);
                        // if (!(await isEmailRegistered(email))) {
                        //     console.log("entered");
                        //     incrementFormStep();
                        //     return;
                        // } else {
                        //     await joinAction(email);
                        // }
                    }}
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
