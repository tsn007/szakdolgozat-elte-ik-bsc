import { Card, Group, ActionIcon, Badge, Text } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { DeletePopup } from "./DeletePopup";
import { useDisclosure } from "@mantine/hooks";
import type { OwnLocation } from "../redux/userApi";
import { AddEditNewAddress } from "./AddEditNewAddress";
import type { AddressType } from "./MapSearchBar";

type CardProps = {
    loc: OwnLocation;
    city: string;
    addr: string;
    userAddress: AddressType | undefined;
};

export function LocationCard({ loc, city, addr, userAddress }: CardProps) {
    const [deleteOpened, { open: deleteOpen, close: deleteClose }] = useDisclosure(false);
    const [editOpened, { open: editOpen, close: editClose }] = useDisclosure(false);
    return (
        <>
            <Card key={loc.id} withBorder shadow="sm" radius="md" padding="lg">
                <Group justify="space-between" mb="xs">
                    <Badge color="blue" variant="light" size="lg">
                        {loc.label || "Unnamed"}
                    </Badge>
                    <Group gap="xs">
                        <ActionIcon variant="subtle" color="gray" onClick={editOpen}>
                            <IconEdit size={20} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" color="red" onClick={deleteOpen}>
                            <IconTrash size={20} />
                        </ActionIcon>
                    </Group>
                </Group>
                <Text fw={500} size="lg">
                    {city}
                </Text>
                <Text size="sm" c="dimmed">
                    {addr}
                </Text>
            </Card>
            <DeletePopup type="location" opened={deleteOpened} close={deleteClose} id={loc.id} />
            <AddEditNewAddress opened={editOpened} close={editClose} userAddress={userAddress} location={loc} />
        </>
    );
}
