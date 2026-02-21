import { Card, Group, Text, Button, Image } from "@mantine/core";
import type { Item } from "../redux/itemsApi";

export function ItemCard({ item }: { item: Item }) {
    return (
        <>
            <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ aspectRatio: "1/1" }}
            >
                <Card.Section>
                    <Image src={item.image} />
                </Card.Section>
                <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500}>{item.name}</Text>
                </Group>

                <Text size="sm" c="dimmed">
                    {item.owner}
                </Text>
                <Text size="sm" c="dimmed">
                    {item.price}
                </Text>

                <Button color="blue" fullWidth mt="md" radius="md">
                    Book classic tour now
                </Button>
            </Card>
        </>
    );
}
