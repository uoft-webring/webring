"use client";
import { useState } from "react";
import { joinAction } from "./actions";

export default function Join() {
    const [isDisabled, setIsDisabled] = useState(false);
    const [email, setEmail] = useState("");

    // TODO: add name field when signing up
    //action={joinAction}
    return (
        <div className="">
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
                        onClick={() => {
                            console.log("hi disabled");
                            setIsDisabled(() => true);
                            joinAction(email);
                        }}
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
