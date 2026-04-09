import {
    Group,
    Modal,
    NumberInput,
    Select,
    TextInput,
    Text,
    Image,
    Box,
    SimpleGrid,
    Button,
    ActionIcon,
} from "@mantine/core";
import { useGetAllCategoryQuery } from "../redux/categoryApi";
import { Dropzone, type DropzoneProps, IMAGE_MIME_TYPE, type FileWithPath } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import imageStyles from "../css/Image.module.css";
import { useState } from "react";
import { ModalText } from "./ModalText";
import type { UserLocationsResponse } from "../redux/userApi";
import { useCreateItemMutation, useEditItemMutation, type UserItem } from "../redux/itemsApi";
import { useForm } from "@mantine/form";
import type { components } from "../types/schema";
import { getApiErrorMessage } from "../utils/errors";
import { showCustomNotification } from "../utils/notifications";

type ModalTypes = {
    opened: boolean;
    close: () => void;
    dropzoneProps?: Partial<DropzoneProps>;
    locations: UserLocationsResponse | undefined;
    itemEdit?: UserItem;
};

type Images = components["schemas"]["ItemImages"];

export function UploadEditItemModal({ opened, close, dropzoneProps, locations, itemEdit }: ModalTypes) {
    const { data: categories } = useGetAllCategoryQuery();
    const catOptions = categories?.map((cat) => ({ value: cat.id, label: cat.name })) || [];
    const locOptions = locations?.map((loc) => ({ value: loc.id, label: loc.label || loc.address })) || [];
    const allImages = [
        ...(itemEdit?.images || []),
        ...(itemEdit?.cover ? [{ id: "cover", image: itemEdit.cover }] : []),
    ];
    const [existingImages, setExistingFiles] = useState<Images[]>(allImages || []);
    const [files, setFiles] = useState<FileWithPath[]>([]);
    const [createItem, { isLoading: isCreateLoading }] = useCreateItemMutation();
    const [editItem, { isLoading: isEditLoading }] = useEditItemMutation();
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: itemEdit?.name || "",
            price: itemEdit?.price || "",
            category: itemEdit?.category || (null as string | null),
            location: itemEdit?.location || (null as string | null),
            cover: itemEdit?.cover || (null as FileWithPath | null),
        },
        validate: {
            name: (value) => (!value ? "The name can not be empty" : null),
            price: (value) => (!value ? "Please provide a price" : null),
            category: (value) => (!value ? "Please choose a category" : null),
            location: (value) => (!value ? "Please choose a location" : null),
            cover: (value) => (!value ? "Please choose a cover image" : null),
        },
    });

    const handleClose = () => {
        close();
        form.reset();
        setFiles([]);
    };

    const handleSubmit = async (values: typeof form.values) => {
        const formData = new FormData();

        if (values.name) formData.append("name", values.name);
        if (values.price) formData.append("price", String(values.price));
        if (values.category) formData.append("category", String(values.category));
        if (values.location) formData.append("location", String(values.location));

        if (values.cover instanceof File) {
            formData.append("cover", values.cover);
        } else if (typeof values.cover === "string") {
            formData.append("existing_cover_url", values.cover);
        }

        files.forEach((file) => {
            if (file !== values.cover) formData.append("images", file);
        });

        existingImages.forEach((img) => {
            if (img.id !== "cover") formData.append("kept_existing_images", String(img.id));
        });

        try {
            if (itemEdit) {
                await editItem({ itemId: itemEdit.id, formData: formData }).unwrap();
            } else {
                await createItem(formData).unwrap();
            }
            close();
        } catch (e) {
            showCustomNotification({
                id: "server-error",
                title: "Error",
                message: getApiErrorMessage(e),
                type: "error",
            });
        }
    };

    return (
        <Modal
            zIndex={1000}
            opened={opened}
            onClose={handleClose}
            title={<ModalText title={itemEdit ? "Edit item" : "Upload item"} />}
            size="lg"
            padding="xl"
            radius="lg"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Group style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Select
                        label="Category"
                        placeholder="Pick a category"
                        data={catOptions}
                        maxDropdownHeight={200}
                        comboboxProps={{ zIndex: 1001 }}
                        w="100%"
                        radius="md"
                        withAsterisk
                        {...form.getInputProps("category")}
                    />
                    <TextInput
                        label="Name"
                        placeholder="Name of your item"
                        w="100%"
                        radius="md"
                        withAsterisk
                        {...form.getInputProps("name")}
                    />
                    <NumberInput
                        allowNegative={false}
                        label="Price"
                        placeholder="Price per day"
                        w="100%"
                        radius="md"
                        decimalScale={2}
                        withAsterisk
                        {...form.getInputProps("price")}
                    />
                    <Select
                        maxDropdownHeight={200}
                        label="Location"
                        w="100%"
                        radius="md"
                        placeholder="Choose a location"
                        data={locOptions}
                        withAsterisk
                        {...form.getInputProps("location")}
                        comboboxProps={{ zIndex: 1001 }}
                    />

                    <Box w="100%">
                        <Text fw={400}>Images of the item</Text>
                        <Dropzone
                            p={20}
                            onDrop={(acceptedFiles) => {
                                setFiles(acceptedFiles);

                                if (!form.values.cover && acceptedFiles.length > 0) {
                                    form.setFieldValue("cover", acceptedFiles[0]);
                                }
                            }}
                            onReject={() =>
                                showCustomNotification({
                                    id: "client-error",
                                    title: "Warning",
                                    message: "Some files have been rejected!",
                                    type: "warning",
                                })
                            }
                            // eslint-disable-next-line no-magic-numbers
                            maxSize={5 * 1024 ** 2}
                            accept={IMAGE_MIME_TYPE}
                            radius="md"
                            style={{
                                borderColor: form.errors.cover ? "var(--mantine-color-red-6)" : undefined,
                            }}
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
                        {form.errors.cover && (
                            <Text c="red" size="sm" mt={5}>
                                {files.length === 0 && existingImages.length === 0
                                    ? "Please upload at least one image!"
                                    : form.errors.cover}{" "}
                            </Text>
                        )}
                        <SimpleGrid cols={{ base: 1, sm: 3 }} mt={40} w="100%">
                            {existingImages.map((img, index) => {
                                const isChosen = form.values.cover === img.image;
                                return (
                                    <Box key={img.id} pos="relative">
                                        <ActionIcon
                                            variant="filled"
                                            color="gray"
                                            pos="absolute"
                                            top={5}
                                            right={5}
                                            onClick={() => {
                                                setExistingFiles((currentFiles) =>
                                                    currentFiles.filter((_, i) => i !== index),
                                                );
                                                if (form.values.cover === img.image) {
                                                    form.setFieldValue("cover", null);
                                                }
                                            }}
                                        >
                                            <IconX color="red" size={20} />
                                        </ActionIcon>
                                        <Image
                                            radius="md"
                                            src={img.image}
                                            className={`${imageStyles.preview} ${isChosen ? imageStyles.choosen : ""}`}
                                            onClick={() => form.setFieldValue("cover", img.image)}
                                        />
                                    </Box>
                                );
                            })}
                            {files.map((file, index) => {
                                const imageUrl = URL.createObjectURL(file);
                                const isChosen = form.values.cover === file;
                                return (
                                    <Box key={`new-${index}`} pos="relative">
                                        <ActionIcon
                                            variant="filled"
                                            color="gray"
                                            pos="absolute"
                                            top={5}
                                            right={5}
                                            onClick={() => {
                                                setFiles((currentFiles) => currentFiles.filter((_, i) => i !== index));
                                                if (form.values.cover === file) {
                                                    form.setFieldValue("cover", null);
                                                }
                                            }}
                                        >
                                            <IconX color="red" size={20} />
                                        </ActionIcon>
                                        <Image
                                            radius="md"
                                            src={imageUrl}
                                            onLoad={() => URL.revokeObjectURL(imageUrl)}
                                            className={`${imageStyles.preview} ${isChosen ? imageStyles.choosen : ""}`}
                                            onClick={() => form.setFieldValue("cover", file)}
                                        />
                                    </Box>
                                );
                            })}
                        </SimpleGrid>
                    </Box>
                </Group>
                <Box style={{ display: "flex", gap: "10px" }} mt={20}>
                    <Button type="submit" loading={isCreateLoading || isEditLoading}>
                        Save
                    </Button>
                    <Button color="red" onClick={handleClose}>
                        Cancel
                    </Button>
                </Box>
            </form>
        </Modal>
    );
}
