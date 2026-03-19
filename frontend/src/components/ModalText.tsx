import { Text } from "@mantine/core";

export function ModalText({ title }: { title: string }) {
    return (
        <Text fw={500} size="xl">
            {title}
        </Text>
    );
}
