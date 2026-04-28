import { Modal, Text, Button, Box } from "@mantine/core";
import { ModalText } from "./ModalText";
import { useDeleteLocationMutation } from "../redux/userApi";
import { useDeleteItemMutation } from "../redux/itemsApi";
import { getApiErrorMessage } from "../utils/errors";
import { showCustomNotification } from "../utils/notifications";

export function DeletePopup({
    type,
    opened,
    close,
    id,
}: {
    type: string;
    opened: boolean;
    close: () => void;
    id: string;
}) {
    const [deleteLocation, { isLoading: isLocationLoading }] = useDeleteLocationMutation();
    const [deleteItem, { isLoading: isItemLoading }] = useDeleteItemMutation();

    const handleDelete = async () => {
        if (type === "location") {
            try {
                await deleteLocation(id).unwrap();
                close();
            } catch (e) {
                close();
                showCustomNotification({
                    id: "server-error",
                    title: "Error",
                    message: getApiErrorMessage(e),
                    type: "error",
                });
            }
        } else if (type === "item") {
            try {
                await deleteItem(id).unwrap();
                close();
            } catch (e) {
                showCustomNotification({
                    id: "server-error",
                    title: "Error",
                    message: getApiErrorMessage(e),
                    type: "error",
                });
            }
        }
    };

    return (
        <Modal radius="lg" opened={opened} onClose={close} title={<ModalText title="Are you sure?" />} zIndex={1000}>
            <Text>{`This ${type} will be permanently deleted!`}</Text>
            <Box mt={20} style={{ display: "flex", gap: "10px" }}>
                <Button color="red" loading={isLocationLoading || isItemLoading} onClick={handleDelete}>
                    Yes, delete
                </Button>
                <Button onClick={close}>No, go back</Button>
            </Box>
        </Modal>
    );
}
