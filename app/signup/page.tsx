import { signUpAction } from "./actions";

export default function SignUp() {
    return (
        <div className="flex">
            <form action={signUpAction} className="flex flex-col">
                <label>UofT Email:</label>
                <input
                    name="email"
                    placeholder="youremail@example.com"
                    className="border"
                    required
                />
                <label>Name:</label>
                <input
                    name="name"
                    placeholder="john doe"
                    className="border"
                    required
                />
                <button
                    className={`border my-1 cursor-pointer hover:bg-red-400`}
                    type="submit"
                >
                    Continue
                </button>
            </form>
        </div>
    );
}
