import { Avatar, Box, Card, Flex, Paper, ScrollArea, Text } from "@mantine/core";
import { useGetUserConversationsQuery } from "../redux/chatApi";
import { ConversationWindow } from "./ConversationWindow";
import cardStyles from "../css/Card.module.css";
import { useState } from "react";

export function Messages() {
    const { data: conversations, isLoading } = useGetUserConversationsQuery();
    const [selectedConvo, setSelectedConvo] = useState<string>("");
    const activeConvo = selectedConvo || (conversations?.length ? conversations[0].id : "");

    if (isLoading) {
        return <Text>Töltés...</Text>;
    }

    return (
        <Flex gap="xl" h="calc(100vh - 100px)" p="md">
            <Paper bg="var(--mantine-color-dark-6)" radius="md" p={10}>
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
                            onClick={() => setSelectedConvo(conversation.id)}
                        >
                            <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <Avatar size="lg" src={conversation.other.profile_pic} />
                                <Text>{`${conversation.other.first_name} ${conversation.other.last_name}`}</Text>
                            </Box>
                        </Card>
                    ))}
                </ScrollArea>
            </Paper>
            <Box style={{ flex: 1 }} h="100%">
                <ConversationWindow convId={activeConvo} />
            </Box>
        </Flex>
    );
}
