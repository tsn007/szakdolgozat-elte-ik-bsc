import { AspectRatio, Box, Card, Text, Divider, Group, ActionIcon, Image } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import type { UserItem } from "../redux/itemsApi";
import { DeletePopup } from "./DeletePopup";
import { useDisclosure } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import cardStyles from "../css/Card.module.css";
import { UploadEditItemModal } from "./UploadEditItemModal";
import { useProfileContext } from "../hooks/profileContextHook";

export function ProfileItemCard({ item }: { item: UserItem }) {
    const [deleteOpened, { open: deleteOpen, close: deleteClose }] = useDisclosure(false);
    const [editOpened, { open: editOpen, close: editClose }] = useDisclosure(false);
    const navigate = useNavigate();
    const { locations } = useProfileContext();

    return (
        <>
            <Card
                radius="lg"
                h={150}
                my={20}
                onClick={() => navigate(`/items/${item.id}`)}
                className={cardStyles.userItem}
            >
                <Box mx={10} style={{ display: "flex", gap: "30px", alignItems: "center" }} h="100%">
                    <Box h="100%" w={100} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <AspectRatio ratio={1 / 1}>
                            <Image radius="lg" src={item.cover} fit="cover" />
                        </AspectRatio>
                    </Box>
                    <Box w="100%" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box>
                            <Text fw={500} size="xl">
                                {item.name}
                            </Text>
                            <Text>{item.price} €</Text>
                        </Box>
                        <Box style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <Text>{new Date(item.created_at).toLocaleDateString()}</Text>
                            <Divider h={100} orientation="vertical" />
                            <Group gap="xs">
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        editOpen();
                                    }}
                                >
                                    <IconEdit size={20} />
                                </ActionIcon>
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteOpen();
                                    }}
                                >
                                    <IconTrash size={20} />
                                </ActionIcon>
                            </Group>
                        </Box>
                    </Box>
                </Box>
            </Card>
            <DeletePopup type="item" opened={deleteOpened} close={deleteClose} id={item.id} />
            <UploadEditItemModal opened={editOpened} close={editClose} locations={locations} itemEdit={item} />
        </>
    );
}
