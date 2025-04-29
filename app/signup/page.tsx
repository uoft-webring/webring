'use client';

import { useState } from 'react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="">
            <h1>Sign up form:</h1>
            <div className="w-[32em]">
                <form className="flex flex-col">
                    <label>Email:</label>
                    <input className="border" />
                    <label>Password:</label>
                    <input className="border" />
                    <button className="border my-1" type="submit">
                        Sign up
                    </button>
                </form>
            </div>
        </div>
    );
}
