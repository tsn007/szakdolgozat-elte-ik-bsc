import { Box, Modal, Button, TextInput } from "@mantine/core";
import { Map } from "./Map";
import type { CoordsType } from "./SearchLayout";
import { useRef, useState } from "react";
import { ModalText } from "./ModalText";
import { useAddNewLocationMutation } from "../redux/userApi";
import type { AddressType } from "./MapSearchBar";

type NewAddressProps = {
    opened: boolean;
    close: () => void;
    userCoords: CoordsType | undefined;
    userAddress: AddressType | undefined;
};

export function AddNewAddress({ opened, close, userCoords, userAddress }: NewAddressProps) {
    const [addLocation, { isLoading }] = useAddNewLocationMutation();
    const labelRef = useRef<HTMLInputElement>(null);
    const houseNumberRef = useRef<HTMLInputElement>(null);
    const floorRef = useRef<HTMLInputElement>(null);
    const doorRef = useRef<HTMLInputElement>(null);
    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address: AddressType | null;
    } | null>(null);

    const activeLocation =
        selectedLocation ||
        (userCoords
            ? {
                  lat: userCoords.lat,
                  lng: userCoords.lng,
                  address: userAddress,
              }
            : null);

    const handleClose = () => {
        close();
        setSelectedLocation(null);
    };

    const handleSubmit = async (
        selectedLocation: {
            lat: number;
            lng: number;
            address: AddressType | null | undefined;
        } | null,
    ) => {
        if (!selectedLocation || !selectedLocation.address) {
            return;
        }

        const finalLabel = labelRef.current?.value;
        const userExtra = houseNumberRef.current?.value + "," + floorRef.current?.value + "," + doorRef.current?.value;
        const locationObject = {
            lat: String(selectedLocation?.lat),
            lng: String(selectedLocation?.lng),
            address:
                selectedLocation?.address.postcode +
                ", " +
                (selectedLocation.address.city || selectedLocation.address.town || selectedLocation.address.village) +
                ", " +
                selectedLocation.address.road +
                " " +
                (selectedLocation.address.house_number || "") +
                userExtra,
            label: finalLabel,
        };

        try {
            await addLocation(locationObject).unwrap();
            handleClose();
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <Modal opened={opened} onClose={handleClose} zIndex={1000} size="lg" title={<ModalText title="New address" />}>
            <Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
                <TextInput radius="md" placeholder="Name this location" label="Label" w="100%" ref={labelRef} />
                <Map
                    userCoords={userCoords}
                    withSearch={true}
                    onLocationSelect={(lat, lng, address) => {
                        setSelectedLocation({ lat, lng, address });
                    }}
                    selectedLocation={activeLocation}
                />
                <Box w="100%" style={{ display: "flex", gap: "10px" }}>
                    <TextInput
                        radius="md"
                        ref={houseNumberRef}
                        w="100%"
                        label="House number"
                        placeholder="Enter the exact house number"
                    />
                    <TextInput radius="md" ref={floorRef} w="100%" label="Floor" placeholder="Enter the floor number" />
                    <TextInput radius="md" ref={doorRef} w="100%" label="Door" placeholder="Enter your door number" />
                </Box>
            </Box>
            <Button w={100} radius="md" mt={30} loading={isLoading} onClick={() => handleSubmit(activeLocation)}>
                Add
            </Button>
        </Modal>
    );
}
