'use client';

import { useState } from 'react';

// TODO:
// - make default option to sign in using email authentication code

export default function Signin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="">
            <h1>Sign in form:</h1>
            <div className="w-[32em]">
                <form className="flex flex-col">
                    <label>Email:</label>
                    <input className="border" />
                    <label>Password:</label>
                    <input className="border" />
                    <button className="border my-1" type="submit">
                        Sign in
                    </button>
                </form>
            </div>
            <p>
                Not yet registered?{' '}
                <a href="/signup" className="text-blue-700 underline">
                    Create account!
                </a>
            </p>
        </div>
    );
}
