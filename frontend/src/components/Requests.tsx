import { Container, Text } from "@mantine/core";
import { useParams } from "react-router-dom";
import { useGetUserRequestsQuery } from "../redux/reservationsApi";
import { InboxCard } from "./InboxCard";
import { InboxTab, type InboxTabType } from "../consts/inboxTabs";

export function Requests() {
    const { resStatus } = useParams();
    const currentTab = (resStatus as InboxTabType) || InboxTab.REQUESTS;
    const { data: rentals } = useGetUserRequestsQuery(currentTab);
    return (
        <Container>
            {rentals?.length === 0 && <Text ta="center" mt={20}>Nothing found!</Text>}
            {rentals?.map((rental) => (
                <InboxCard key={rental.id} rental={rental} tab={resStatus} />
            ))}
        </Container>
    );
}
