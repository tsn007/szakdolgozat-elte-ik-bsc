import { Container, Grid, Group, Pagination } from "@mantine/core";
import { ItemCard } from "./ItemCard";
import { useSearchContext } from "../hooks/searchContextHook";

const PAGE_SIZE = 30;

export function CardView() {
    const { items, setPage, page } = useSearchContext();
    const totalPages = Math.ceil(items.count / PAGE_SIZE);
    return (
        <>
            <Container fluid maw={1600}>
                <Grid pr={{ base: 0, md: 50 }} style={{ flex: 1 }}>
                    {items.results?.map((item) => (
                        <Grid.Col
                            span={{
                                base: 12,
                                sm: 6,
                                md: 6,
                                lg: 4,
                                xl: 3,
                            }}
                            key={item.id}
                        >
                            <ItemCard item={item} isMapPopup={false} />
                        </Grid.Col>
                    ))}
                </Grid>
                <Group justify="center" pr={{ base: 0, md: 50 }} pt={80} pb={40}>
                    <Pagination total={totalPages} radius="md" onChange={setPage} value={page} />
                </Group>
            </Container>
        </>
    );
}
