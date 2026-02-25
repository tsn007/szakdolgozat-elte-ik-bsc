import { Card, Group, Text, Button, Image, Box } from "@mantine/core";
import type { Item } from "../redux/itemsApi";
import cardStyles from "../css/Card.module.css";
import { IconMapPinFilled, IconUserFilled } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";

export function ItemCard({ item }: { item: Item }) {
    const { hovered, ref } = useHover();
    return (
        <>
            <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                withBorder
                h="100%"
                display="flex"
                style={{ flexDirection: "column" }}
                className={cardStyles.item}
                ref={ref}
            >
                <Card.Section>
                    {(!hovered || item.images.length === 0) && (
                        <Image src={item.cover} h={200} fit="cover" />
                    )}
                    {hovered && item.images.length !== 0 && (
                        <Carousel withIndicators height={200}>
                            <Carousel.Slide>
                                <Image src={item.cover} />
                            </Carousel.Slide>
                            {item.images.map((img) => (
                                <Carousel.Slide key={img.id}>
                                    <Image src={img.image} />
                                </Carousel.Slide>
                            ))}
                        </Carousel>
                    )}
                </Card.Section>
                <Group justify="space-between" mt="md" mb="auto" pb="md">
                    <Text fw={500} size="lg">
                        {item.name}
                    </Text>
                </Group>

                <Box
                    pb={20}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                        paddingLeft: "5px",
                    }}
                >
                    <Box style={{ display: "flex", gap: "5px" }}>
                        <IconUserFilled size={20} />
                        <Text size="sm" c="dimmed">
                            {item.owner.first_name + " " + item.owner.last_name}
                        </Text>
                    </Box>
                    <Box
                        style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                        }}
                    >
                        <IconMapPinFilled color="#c22626" />
                        <Text size="sm" c="dimmed">
                            {item.location.address}
                        </Text>
                    </Box>
                </Box>
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
                    <Button color="blue" w={100} radius="md">
                        Details
                    </Button>
                </Box>
            </Card>
        </>
    );
}
