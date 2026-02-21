import { Container, Grid } from "@mantine/core";
import Layout from "./Layout";
import { useGetAllItemsQuery } from "../redux/itemsApi";
import { ItemCard } from "./ItemCard";

export function Home() {
    const { data: items } = useGetAllItemsQuery();
    return (
        <>
            <Layout isGuest={false}>
                <Container size="xl">
                    <Grid>
                        {items?.results?.map((item) => (
                            <Grid.Col span={{ base: 12, md: 3 }}>
                                <ItemCard item={item} />
                            </Grid.Col>
                        ))}
                    </Grid>
                </Container>
            </Layout>
        </>
    );
}
