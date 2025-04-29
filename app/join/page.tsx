'use client';

import { useState } from 'react';

// TODO:
// - make default option to sign in using email authentication code

export default function Signin() {
    const [isSignUp, setIsSignUp] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return isSignUp ? (
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
            <p>
                Registered?{' '}
                <a
                    onClick={() => setIsSignUp(false)}
                    className="text-blue-700 underline cursor-pointer"
                >
                    Login!
                </a>
            </p>
        </div>
    ) : (
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
                <a
                    onClick={() => setIsSignUp(true)}
                    className="text-blue-700 underline cursor-pointer"
                >
                    Create account!
                </a>
            </p>
        </div>
    );
}
