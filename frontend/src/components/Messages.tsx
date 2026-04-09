import { Avatar, Box, Card, Flex, Paper, ScrollArea, Text } from "@mantine/core";
import { useGetUserConversationsQuery } from "../redux/chatApi";
import { ConversationWindow } from "./ConversationWindow";
import cardStyles from "../css/Card.module.css";
import { useSearchParams } from "react-router-dom";

export function Messages() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlConvoId = searchParams.get("convo");
    const urlRentalId = searchParams.get("rental");
    const { data: conversations, isLoading } = useGetUserConversationsQuery();
    const convoFromRental = urlRentalId
        ? conversations?.find((convo) => convo.reservation.id === urlRentalId)?.id
        : null;
    const activeConvo = urlConvoId || convoFromRental || (conversations?.length ? conversations[0].id : "");

    if (isLoading) {
        return <Text>Töltés...</Text>;
    }

    return (
        <Flex gap="xl" h="calc(100vh - 100px)" p="md">
            <Paper bg="light-dark(var(--mantine-color-beige-1), var(--mantine-color-dark-6))" radius="md" p={10}>
                <ScrollArea w={350}>
                    <Text fw={500} size="30px" mb={50} ml={10} mt={10}>
                        Conversations
                    </Text>
                    {conversations?.map((conversation) => (
                        <Card
                            key={conversation.id}
                            radius="md"
                            p={10}
                            className={`${cardStyles.convo} ${conversation.id === activeConvo ? cardStyles.activeConvo : ""}`}
                            onClick={() => setSearchParams({ convo: conversation.id })}
                            bg="light-dark(var(--mantine-color-beige-1), var(--mantine-color-dark-6))"
                        >
                            <Flex align="center" justify="space-between" wrap="nowrap" gap="md">
                                <Flex align="center" gap={10} wrap="nowrap">
                                    <Avatar size="lg" src={conversation.other.profile_pic} />
                                    <Text style={{ whiteSpace: "nowrap" }}>
                                        {`${conversation.other.first_name} ${conversation.other.last_name}`}
                                    </Text>
                                </Flex>
                                <Text
                                    style={{ flex: 1 }}
                                    ta="right"
                                    truncate
                                    fs="italic"
                                    c="var(--mantine-color-gray-5)"
                                    size="sm"
                                >
                                    {conversation.reservation.item.name}
                                </Text>
                            </Flex>
                        </Card>
                    ))}
                    {(!conversations || conversations.length === 0) &&
                        <Text w="100%" ta="center" c="dimmed" fs="italic">No conversations yet!</Text>
                    }
                </ScrollArea>
            </Paper>
            <Box style={{ flex: 1 }} h="100%">
                <ConversationWindow convId={activeConvo} />
            </Box>
        </Flex>
    );
}
