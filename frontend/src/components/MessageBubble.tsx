import { Box, Text, Paper } from "@mantine/core";
import type { components } from "../types/schema";
import { IconCheck, IconChecks } from "@tabler/icons-react";

type Message = components["schemas"]["Message"];

const getDateFormat = (date: Date) => {
    const today = new Date();

    const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else {
        return date.toLocaleDateString();
    }
};

export function MessageBubble({ msg, isUserMsg }: { msg: Message; isUserMsg: boolean }) {
    const sent_on = new Date(msg.created_at);
    return (
        <Box w="100%" style={{ display: "flex", justifyContent: isUserMsg ? "flex-end" : "flex-start" }}>
            <Box
                style={{ display: "flex", flexDirection: "column", alignItems: isUserMsg ? "flex-end" : "flex-start" }}
            >
                <Paper
                    radius="lg"
                    px={10}
                    py={5}
                    bg={isUserMsg ? "var(--mantine-color-blue-7)" : "var(--mantine-color-dark-8)"}
                >
                    <Text>{msg.content}</Text>
                </Paper>
                <Box pt={2} style={{ display: "flex", alignItems: "center" }}>
                    {isUserMsg && !msg.is_read && <IconCheck color="gray" size={15} />}
                    {isUserMsg && msg.is_read && <IconChecks color="gray" size={15} />}
                    <Text c="dimmed" size="12px" px={10}>
                        {getDateFormat(sent_on)}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
}
