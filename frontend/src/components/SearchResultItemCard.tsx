import { Card, Image, Group, Box, Text } from "@mantine/core";
import type { Item } from "../redux/itemsApi";
import cardStyles from "../css/Card.module.css";

export function SearchResultItemCard({ item, onClick }: { item: Item; onClick: () => void }) {
    return (
        <>
            <Card
                withBorder
                w="20vw"
                shadow="sm"
                padding="lg"
                radius="lg"
                display="flex"
                style={{ flexDirection: "column" }}
                className={cardStyles.searchRes}
                bg="transparent"
                onClick={onClick}
            >
                <Card.Section>
                    <Image src={item.cover} fit="cover" />
                </Card.Section>
                <Group justify="space-between" mt="md" mb="auto" pb="xl">
                    <Text fw={500} size="lg">
                        {item.name}
                    </Text>
                </Group>

                <Box
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box style={{ display: "flex", alignItems: "flex-end" }}>
                        <Text fw={500} size="30px">
                            {item.price + "€"}
                        </Text>
                        <Text c="dimmed">/day</Text>
                    </Box>
                </Box>
            </Card>
        </>
    );
}
