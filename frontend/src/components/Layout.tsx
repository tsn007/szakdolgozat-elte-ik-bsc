import { Navbar } from "./Navbar";

export default function Layout({
    children,
    isGuest,
}: {
    children: React.ReactNode;
    isGuest: boolean;
}) {
    return (
        <>
            <Navbar isGuest={isGuest} />
            <main style={{ paddingTop: "100px", paddingBottom: "100px" }}>
                {children}
            </main>
        </>
    );
}
