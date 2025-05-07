import Image from "next/image";
import Loading from "@/components/loading";
import Switch from "@/components/switch";
import Case from "@/components/case";

export default function Home() {
    return (
        <Switch switchValue={true}>
            <Case caseValue={false}>Will display if someTest is false</Case>
            <Case caseValue={true}>Will display if someTest is true</Case>
        </Switch>
    );
}
