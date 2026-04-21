import { Text, Box, TextInput, ScrollArea, Flex, Button } from "@mantine/core";
import { useCreateMessageMutation, useGetConversationMessagesQuery, useMarkAsReadMutation } from "../redux/chatApi";
import { MessageBubble } from "./MessageBubble";
import { useUserData } from "../hooks/userLocation";
import { IconCirclePlus } from "@tabler/icons-react";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { getApiErrorMessage } from "../utils/errors";
import { showCustomNotification } from "../utils/notifications";

export function ConversationWindow({ convId }: { convId: string }) {
    const [page, setPage] = useState(1);
    const { data: messages, isFetching } = useGetConversationMessagesQuery({ convId, page }, { skip: !convId });
    const [markAsRead] = useMarkAsReadMutation();
    const [sendMessage, { isLoading }] = useCreateMessageMutation();
    const { user } = useUserData();

    const inputRef = useRef<HTMLInputElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const distanceFromBottomRef = useRef(0);
    const isLoadingOlderRef = useRef(false);
    const messagesLengthRef = useRef(0);

    const SPACE_FROM_TOP = 50;

    const scrollToBottom = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: "instant",
            });
        }
    };

    const handleSend = async () => {
        if (!inputRef.current || !inputRef.current.value.trim()) return;
        try {
            await sendMessage({ convId: convId, convInfo: { content: inputRef.current.value } }).unwrap();
            inputRef.current.value = "";
        } catch (e) {
            showCustomNotification({
                id: "server-error",
                title: "Error",
                message: getApiErrorMessage(e),
                type: "error",
            });
        }
    };

    useEffect(() => {
        if (convId) {
            markAsRead(convId);
        }
    }, [convId, markAsRead]);

    useLayoutEffect(() => {
        if (!viewportRef.current || !messages?.results) return;

        const currentLength = messages.results.length;
        const prevLength = messagesLengthRef.current;
        messagesLengthRef.current = currentLength;

        if (prevLength === 0 && currentLength > 0) {
            scrollToBottom();
            return;
        }

        if (isLoadingOlderRef.current) {
            viewportRef.current.scrollTop = viewportRef.current.scrollHeight - distanceFromBottomRef.current;
            isLoadingOlderRef.current = false;
        } else if (currentLength > prevLength) {
            scrollToBottom();
        }
    }, [messages?.results]);

    if (convId.length === 0) {
        return (
            <Flex direction="column" h="100%" justify="center" align="center" style={{ flex: 1 }}>
                <Text ta="center" c="dimmed" size="lg">
                    Select a conversation to start!
                </Text>
            </Flex>
        );
    }

    return (
        <Flex direction="column" h="100%" style={{ flex: 1, position: "relative" }}>
            <ScrollArea
                viewportRef={viewportRef}
                style={{ flex: 1 }}
                p="md"
                onScrollPositionChange={({ y }) => {
                    if (viewportRef.current) {
                        distanceFromBottomRef.current = viewportRef.current.scrollHeight - y;
                    }

                    if (y < SPACE_FROM_TOP && !isFetching && messages?.next) {
                        isLoadingOlderRef.current = true;
                        setPage((prev) => prev + 1);
                    }
                }}
            >
                <Flex direction="column" gap="xs">
                    {(!messages || messages.results.length === 0) && (
                        <Text ta="center" c="dimmed">
                            Start this conversation!
                        </Text>
                    )}

                    {messages?.results
                        .slice()
                        .reverse()
                        .map((msg) => (
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
