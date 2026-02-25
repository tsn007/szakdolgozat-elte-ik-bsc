import {
    Accordion,
    Box,
    Container,
    Grid,
    UnstyledButton,
    Text,
} from "@mantine/core";
import Layout from "./Layout";
import { useGetAllItemsQuery } from "../redux/itemsApi";
import { ItemCard } from "./ItemCard";
import { data } from "../consts/filterItems";
import buttonStyles from "../css/Button.module.css";

const itemFilters = data.map((item) => {
    const Icon = item.icon;
    return (
        <Accordion.Item key={item.value} value={item.value}>
            <Accordion.Control icon={<Icon />}>{item.value}</Accordion.Control>
            <Accordion.Panel>{item.description}</Accordion.Panel>
        </Accordion.Item>
    );
});

export function Home() {
    const { data: items } = useGetAllItemsQuery();
    return (
        <>
            <Layout isGuest={false}>
                <Box
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "flex-start",
                        gap: "20px",
                    }}
                    mb={80}
                >
                    <UnstyledButton>
                        <Text p={5} className={buttonStyles.viewPicker}>
                            Card View
                        </Text>
                    </UnstyledButton>
                    <UnstyledButton>
                        <Text p={5} className={buttonStyles.viewPicker}>
                            Map View
                        </Text>
                    </UnstyledButton>
                </Box>
                <Container
                    fluid
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "20px",
                    }}
                >
                    <Box
                        w="15vw"
                        miw={220}
                        style={{
                            position: "sticky",
                            top: "130px",
                            maxHeight: "calc(100vh - 40px)",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                        }}
                    >
                        <Accordion
                            variant="filled"
                            defaultValue="Category"
                            radius="lg"
                        >
                            {itemFilters}
                        </Accordion>
                    </Box>
                    <Grid pr={50} style={{ flex: 1 }}>
                        {items?.results?.map((item) => (
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
                                <ItemCard item={item} />
                            </Grid.Col>
                        ))}
                    </Grid>
                </Container>
            </Layout>
        </>
    );
}
