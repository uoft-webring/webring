import { Tailwind } from "@react-email/components";

export default function Email() {
    return (
        <Tailwind>
            <html className="m-0 p-0 bg-[#27272a]">
                <div className="bg-[#18181b] rounded-xl my-8 p-8 text-white font-sans max-w-[512px] mx-auto">
                    <div className="logo w-[192px] h-[64px] bg-red-500" />
                    <h1 className="mt-12 text-4xl font-bold">
                        Your sign-in OTP
                    </h1>
                    <p className="text-white/60 text-sm font-regular">
                        Use the 6-digit code below to sign into UofT Webring in
                        the same window as the window in which you began your
                        sign in.
                    </p>
                    <div className="bg-[#27272a] mx-auto my-8 py-8 rounded-xl">
                        <h1 className="text-5xl tracking-widest text-white/90 text-center font-black">
                            123123
                        </h1>
                    </div>
                    <p className="text-white/60 text-sm font-regular">
                        If you did not request this code, please ignore this
                        email. No action is required.
                    </p>
                    <hr className="my-12 border-white/20" />
                    <div className="logo w-[144px] h-[48px] bg-red-500 -mt-6 mx-auto" />
                    <p className="text-white/60 text-sm font-regular mt-6 text-center">
                        UofT Webring |{" "}
                        <a
                            href="https://uoftwebring.com"
                            className="no-underline text-white"
                        >
                            https://uoftwebring.com
                        </a>{" "}
                        | Learn why we do what we do{" "}
                        <a
                            href="https://uoftwebring.com"
                            className="no-underline text-white"
                        >
                            here
                        </a>
                        .
                    </p>
                </div>
            </html>
        </Tailwind>
    );
}
