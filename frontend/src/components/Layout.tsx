import { useDisclosure } from "@mantine/hooks";
import { Navbar } from "./Navbar";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export type LayoutContext = {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    searchOpened: boolean;
};

export default function Layout() {
    const [searchOpened, { open: searchOpen, close: searchClose }] = useDisclosure(false);
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const isGuest = location.pathname === "/";

    return (
        <>
            <Navbar
                isGuest={isGuest}
                searchOpened={searchOpened}
                searchClose={searchClose}
                searchOpen={searchOpen}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
            <main style={{ paddingTop: "100px", paddingBottom: "100px" }}>
                <Outlet context={{ searchTerm, setSearchTerm, searchOpened } satisfies LayoutContext} />
            </main>
        </>
    );
}
