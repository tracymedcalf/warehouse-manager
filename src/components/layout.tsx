import type { PropsWithChildren } from "react";
import NavBar from "./navbar";

export default function Layout (props: PropsWithChildren) {
    return (
        <main className="flex h-screen justify-center">
            <div className="bg-black-200 border-white-400 h-full w-full md:max-w-2xl">
                <NavBar />
                <div>{props.children}</div>
            </div>
        </main>
    );
}