/* eslint-disable no-magic-numbers */
import { Card, Group, Text, Button, Image, Box, AspectRatio } from "@mantine/core";
import type { Item } from "../redux/itemsApi";
import cardStyles from "../css/Card.module.css";
import { IconMapPinFilled, IconUserFilled } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";

export function ItemCard({ item, isMapPopup }: { item: Item; isMapPopup: boolean }) {
    const { hovered, ref } = useHover();
    return (
        <>
            <Card
                shadow="sm"
                padding="lg"
                radius="lg"
                withBorder
                display="flex"
                style={{ flexDirection: "column" }}
                className={isMapPopup ? cardStyles.popup : cardStyles.item}
                ref={ref}
            >
                <Card.Section style={{ overflow: "hidden" }}>
                    <AspectRatio ratio={4 / 3}>
                        {(!hovered || item.images.length === 0) && (
                            <Image src={item.cover} w="100%" h="100%" fit="cover" />
                        )}
                        {hovered && item.images.length !== 0 && (
                            <Carousel withIndicators style={{ width: "100%", height: "100%" }}>
                                <Carousel.Slide>
                                    <Image src={item.cover} w="100%" h="100%" fit="cover" />
                                </Carousel.Slide>
                                {item.images.map((img) => (
                                    <Carousel.Slide key={img.id}>
                                        <Image src={img.image} w="100%" h="100%" fit="cover" />
                                    </Carousel.Slide>
                                ))}
                            </Carousel>
                        )}
                    </AspectRatio>
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
                    <Box
                        style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                        }}
                    >
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
                        <IconMapPinFilled size={20} color="#c22626" style={{ flexShrink: 0 }} />
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
