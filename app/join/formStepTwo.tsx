"use client";
import { useState } from "react";
import { joinAction, isEmailRegistered } from "./actions";

export default function FormStepTwo({ username, setUsername }) {
    const [isDisabled, setIsDisabled] = useState(false);
    return (
        <div className="w-[32em]">
            <form className="flex flex-col">
                <label>Username</label>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    name="username"
                    placeholder="john_doe"
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
                    }}
                >
                    Register
                </button>
            </form>
        </div>
    );
}
