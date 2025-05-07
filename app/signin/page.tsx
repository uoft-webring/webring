import { signInAction } from "./actions";

export default function Signin() {
    return (
        <div className="flex">
            <form action={signInAction} className="flex flex-col">
                <label>UofT Email:</label>
                <input
                    name="email"
                    placeholder="youremail@example.com"
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
