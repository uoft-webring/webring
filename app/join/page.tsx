// "use client";

// import { useState } from "react";
// import { signUpAction, signInA, isEmailRegistered } from "./actions";
// import Switch from "@/components/switch";
// import Case from "@/components/case";
// import FormStepOne from "./formStepOne";
// import FormStepTwo from "./formStepTwo";

// export default function Join() {
//     const [email, setEmail] = useState("");
//     const [username, setUsername] = useState("");
//     const [formStep, setFormStep] = useState(1);
//     const [isDisabled, setIsDisabled] = useState(false);

//     // TODO: add name field when signing up
//     //action={joinAction}
//     // TODO: probably put the form actions into components
//     // TODO: fix onclick button disabling behaviour
//     function handleEmail(email: string) {
//         setEmail(email);
//     }

//     function incrementFormStep() {
//         setFormStep((formStep) => formStep + 1);
//     }

//     function handleUsername(username: string) {
//         setUsername(username);
//     }

//     // <Switch switchValue={formStep}>
//     //     <Case caseValue={1}>
//     //         <FormStepOne
//     //             email={email}
//     //             setEmail={handleEmail}
//     //             incrementFormStep={incrementFormStep}
//     //         ></FormStepOne>
//     //     </Case>
//     //     <Case caseValue={2}>
//     //         <FormStepTwo
//     //             username={username}
//     //             setUsername={handleUsername}
//     //         ></FormStepTwo>
//     //     </Case>
//     // </Switch>;
//     return (
//         <div className="flex">
//             <form action={} className="flex flex-col">
//                 <label>UofT Email:</label>
//                 <input
//                     name="email"
//                     placeholder="youremail@example.com"
//                     className="border"
//                     required
//                 />
//                 <input
//                     name="name"
//                     placeholder="john doe"
//                     className="border"
//                     required
//                 />
//                 <button
//                     disabled={isDisabled}
//                     className={`border my-1 ${
//                         isDisabled ? "cursor-not-allowed" : "cursor-pointer"
//                     } hover:bg-red-400`}
//                     type="submit"
//                 >
//                     Continue
//                 </button>
//             </form>
//         </div>
//     );
// }

export default function Join() {
    return <div></div>;
}
