import { Card, Container, Image, Box, AspectRatio, Text } from "@mantine/core";
import { useGetUserItemsQuery } from "../redux/userApi";

export function UserItems() {
    const { data: items } = useGetUserItemsQuery();
    return (
        <Container>
            {items?.map((item) => (
                <Card radius="lg" h={150} my={20}>
                    <Box style={{ display: "flex", gap: "30px", alignItems: "center" }} h="100%">
                        <Box
                            h="100%"
                            w={100}
                            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                        >
                            <AspectRatio ratio={1 / 1}>
                                <Image radius="lg" src={item.cover} fit="cover" />
                            </AspectRatio>
                        </Box>
                        <Box w="80%" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                                <Text fw={500} size="xl">
                                    {item.name}
                                </Text>
                                <Text>{item.price} €</Text>
                            </Box>
                            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
                        </Box>
                    </Box>
                </Card>
            ))}
        </Container>
    );
}
