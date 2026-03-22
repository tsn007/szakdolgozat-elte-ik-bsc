import { Container } from "@mantine/core";
import { useGetUserItemsQuery } from "../redux/userApi";
import { ProfileItemCard } from "./ProfileItemCard";

export function UserItems() {
    const { data: items } = useGetUserItemsQuery();
    return (
        <>
            <Container>
                {items?.map((item) => (
                    <ProfileItemCard key={item.id} item={item} />
                ))}
            </Container>
        </>
    );
}
