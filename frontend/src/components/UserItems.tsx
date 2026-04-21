import { Container, Text } from "@mantine/core";
import { useGetUserItemsQuery } from "../redux/userApi";
import { ProfileItemCard } from "./ProfileItemCard";

export function UserItems() {
    const { data: items } = useGetUserItemsQuery();
    return (
        <>
            <Container>
                {(!items || items.length === 0) && <Text ta='center' mt={20}>You haven't uploaded any items yet!</Text>}
                {items?.map((item) => (
                    <ProfileItemCard key={item.id} item={item} />
                ))}
            </Container>
        </>
    );
}
