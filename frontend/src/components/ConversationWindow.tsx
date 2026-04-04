import { Text, Box, TextInput, ScrollArea, Flex, Button } from "@mantine/core";
import { useCreateMessageMutation, useGetConversationMessagesQuery, useMarkAsReadMutation } from "../redux/chatApi";
import { MessageBubble } from "./MessageBubble";
import { useUserData } from "../hooks/userLocation";
import { IconCirclePlus } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

export function ConversationWindow({ convId }: { convId: string }) {
    const { data: messages } = useGetConversationMessagesQuery(convId, {
        skip: !convId,
    });
    const [markAsRead] = useMarkAsReadMutation();
    const [sendMessage, { isLoading }] = useCreateMessageMutation();
    const { user } = useUserData();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSend = async () => {
        if (!inputRef.current || !inputRef.current.value.trim()) return;
        try {
            await sendMessage({ convId: convId, convInfo: { content: inputRef.current.value } }).unwrap();
            inputRef.current.value = "";
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (convId) {
            markAsRead(convId);
        }
    }, [convId, messages, markAsRead]);

    return (
        <Flex direction="column" h="100%" style={{ flex: 1, position: "relative" }}>
            <ScrollArea style={{ flex: 1 }} p="md">
                <Flex direction="column" gap="xs">
                    {(!messages || messages.results.length === 0) && (
                        <Text ta="center" c="dimmed">
                            Start this conversation!
                        </Text>
                    )}

                    {messages?.results.map((msg) => (
                        <MessageBubble key={msg.id} msg={msg} isUserMsg={user?.email === msg.sender.email} />
                    ))}
                </Flex>
            </ScrollArea>

            <Box p="md" style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}>
                <TextInput
                    ref={inputRef}
                    radius="lg"
                    placeholder="Type a message..."
                    leftSection={<IconCirclePlus />}
                    rightSectionWidth={62}
                    rightSection={
                        <Button radius="xl" size="xs" onClick={handleSend} loading={isLoading}>
                            Send
                        </Button>
                    }
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
            </Box>
        </Flex>
    );
}
