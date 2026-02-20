import { Box } from "@mantine/core";
import Layout from "./Layout";

export function Dashboard() {
    return (
        <>
            <Layout isGuest={false}>
                <Box style={{ display: "flex", height: "200vh" }}></Box>
            </Layout>
        </>
    );
}
