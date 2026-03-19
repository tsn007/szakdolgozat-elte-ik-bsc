import { Group, Modal, NumberInput, Select, TextInput, Text, Image, Box, SimpleGrid, Button } from "@mantine/core";
import { useGetAllCategoryQuery } from "../redux/categoryApi";
import { Dropzone, type DropzoneProps, IMAGE_MIME_TYPE, type FileWithPath } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import imageStyles from "../css/Image.module.css";
import { useState } from "react";
import { ModalText } from "./ModalText";
import type { UserLocationsResponse } from "../redux/userApi";
import { useCreateItemMutation } from "../redux/itemsApi";
import { useForm } from "@mantine/form";

type ModalTypes = {
    opened: boolean;
    close: () => void;
    dropzoneProps?: Partial<DropzoneProps>;
    locations: UserLocationsResponse | undefined;
};

export function UploadItemModal({ opened, close, dropzoneProps, locations }: ModalTypes) {
    const { data: categories } = useGetAllCategoryQuery();
    const catOptions = categories?.map((cat) => ({ value: cat.id, label: cat.name })) || [];
    const locOptions = locations?.map((loc) => ({ value: loc.id, label: loc.label || loc.address })) || [];
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [createItem, { isLoading }] = useCreateItemMutation();
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            price: "",
            category: null as string | null,
            location: null as string | null,
            cover: null as FileWithPath | null,
        },
    });

    const handleClose = () => {
        close();
        setFiles([]);
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        files.forEach((file) => {
            if (file !== form.values.cover) {
                formData.append("images", file);
            }
        });
        if (form.values.name) formData.append("name", form.values.name);
        if (form.values.price) formData.append("price", String(form.values.price));
        if (form.values.category) formData.append("category", form.values.category);
        if (form.values.cover) formData.append("cover", form.values.cover);
        if (form.values.location) formData.append("location", form.values.location);

        try {
            await createItem(formData).unwrap();
            setFiles([]);
            close();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Modal
            zIndex={1000}
            opened={opened}
            onClose={handleClose}
            title={<ModalText title="Upload item" />}
            size="lg"
            padding="xl"
        >
            <Group style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Select
                    label="Category"
                    placeholder="Pick a category"
                    data={catOptions}
                    maxDropdownHeight={200}
                    comboboxProps={{ zIndex: 1001 }}
                    w="100%"
                    radius="md"
                    {...form.getInputProps("category")}
                />
                <TextInput
                    label="Name"
                    placeholder="Name of your item"
                    w="100%"
                    radius="md"
                    {...form.getInputProps("name")}
                />
                <NumberInput
                    allowNegative={false}
                    label="Price"
                    placeholder="Price per day"
                    w="100%"
                    radius="md"
                    decimalScale={2}
                    {...form.getInputProps("price")}
                />
                <Select
                    maxDropdownHeight={200}
                    label="Location"
                    w="100%"
                    radius="md"
                    placeholder="Choose a location"
                    data={locOptions}
                    {...form.getInputProps("location")}
                    comboboxProps={{ zIndex: 1001 }}
                />

                <Box w="100%">
                    <Text fw={400}>Images of the item</Text>
                    <Dropzone
                        p={20}
                        onDrop={setFiles}
                        onReject={(files) => console.log("rejected files", files)}
                        // eslint-disable-next-line no-magic-numbers
                        maxSize={5 * 1024 ** 2}
                        accept={IMAGE_MIME_TYPE}
                        radius="md"
                        {...dropzoneProps}
                    >
                        <Group justify="center" style={{ pointerEvents: "none" }} h={150}>
                            <Dropzone.Accept>
                                <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                            </Dropzone.Accept>
                            <Dropzone.Reject>
                                <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                            </Dropzone.Reject>
                            <Dropzone.Idle>
                                <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                            </Dropzone.Idle>

                            <div>
                                <Text size="xl" inline>
                                    Drag images here or click to select files
                                </Text>
                            </div>
                        </Group>
                    </Dropzone>
                    <SimpleGrid cols={{ base: 1, sm: 3 }} mt={40} w="100%">
                        {files.map((file, index) => {
                            const imageUrl = URL.createObjectURL(file);
                            const isChosen = form.values.cover === file;
                            return (
                                <Image
                                    radius="md"
                                    key={index}
                                    src={imageUrl}
                                    onLoad={() => URL.revokeObjectURL(imageUrl)}
                                    className={`${imageStyles.preview} ${isChosen ? imageStyles.choosen : ""}`}
                                    onClick={() => form.setFieldValue("cover", file)}
                                />
                            );
                        })}
                    </SimpleGrid>
                </Box>
            </Group>
            <Box style={{ display: "flex", gap: "10px" }} mt={20}>
                <Button onClick={handleSubmit} loading={isLoading}>
                    Upload Item
                </Button>
                <Button color="red" onClick={handleClose}>
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
}
