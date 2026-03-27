/* eslint-disable no-magic-numbers */
import { Box, Modal, Button, TextInput, NumberInput } from "@mantine/core";
import { Map } from "./Map";
import type { CoordsType } from "./SearchLayout";
import { useMemo, useRef, useState } from "react";
import { ModalText } from "./ModalText";
import { useAddNewLocationMutation, useEditLocationMutation, type OwnLocation } from "../redux/userApi";
import type { AddressType } from "./MapSearchBar";

type NewAddressProps = {
    opened: boolean;
    close: () => void;
    userCoords?: CoordsType | undefined;
    userAddress: AddressType | undefined;
    location?: OwnLocation;
};

export function AddEditNewAddress({ opened, close, userCoords, userAddress, location }: NewAddressProps) {
    const [addLocation, { isLoading: isAddLoading }] = useAddNewLocationMutation();
    const [editLocation, { isLoading: isEditLoading }] = useEditLocationMutation();
    const { house_num, floor, door } = useMemo(() => {
        if (!location?.address) {
            return { house_num: "", floor: "", door: "" };
        }

        const splitAddr = location.address.split(",");
        const road = splitAddr[2]?.split(" ") || [];

        return {
            house_num: road[road.length - 1] || "",
            floor: splitAddr[3]?.split(".")[0] || "",
            door: splitAddr[4]?.split(".")[0] || "",
        };
    }, [location]);
    const MAX_NUMBER_OF_DIGITS = 6;

    const labelRef = useRef<HTMLInputElement>(null);
    const [houseNumValue, setHouseNumValue] = useState(house_num);
    const [houseNumError, setHouseNumError] = useState(false);
    const floorRef = useRef<HTMLInputElement>(null);
    const doorRef = useRef<HTMLInputElement>(null);

    const [selectedLocation, setSelectedLocation] = useState<{
        lat: number;
        lng: number;
        address: AddressType | null;
    } | null>(null);

    const activeLocation =
        location && !selectedLocation
            ? { lat: Number(location?.lat), lng: Number(location?.lng) }
            : selectedLocation ||
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
        setHouseNumValue(house_num);
    };

    const handleSubmit = async () => {
        if (!houseNumValue || houseNumValue.trim() === "") {
            setHouseNumError(true);
            return;
        }

        setHouseNumError(false);

        const finalLabel = labelRef.current?.value;
        const extraParts = [
            houseNumValue,
            floorRef.current?.value ? `${floorRef.current.value}. floor` : null,
            doorRef.current?.value ? `${doorRef.current.value}. door` : null,
        ].filter(Boolean);
        const userExtra = extraParts.length > 0 ? " " + extraParts.join(", ") : "";

        let finalLat: string;
        let finalLng: string;
        let finalAddressString: string;

        if (selectedLocation && selectedLocation.address) {
            finalLat = String(selectedLocation.lat.toFixed(MAX_NUMBER_OF_DIGITS));
            finalLng = String(selectedLocation.lng.toFixed(MAX_NUMBER_OF_DIGITS));
            const addr = selectedLocation.address;
            finalAddressString = `${addr.postcode || ""}, ${addr.city || addr.town || addr.village || ""}, ${addr.road || ""} ${userExtra}`;
        } else if (location) {
            finalLat = String(location.lat);
            finalLng = String(location.lng);
            const splitAddr = location.address.split(",");
            const zip = splitAddr[0] || "";
            const city = splitAddr[1] || "";
            const roadParts = splitAddr[2]?.trim().split(" ") || [];
            const roadName = roadParts.slice(0, -1).join(" ");

            finalAddressString = `${zip.trim()}, ${city.trim()}, ${roadName} ${userExtra}`;
        } else if (userCoords && userAddress) {
            finalLat = String(userCoords.lat.toFixed(MAX_NUMBER_OF_DIGITS));
            finalLng = String(userCoords.lng.toFixed(MAX_NUMBER_OF_DIGITS));
            finalAddressString = `${userAddress.postcode || ""}, ${userAddress.city || userAddress.town || userAddress.village || ""}, ${userAddress.road || ""} ${userExtra}`;
        } else {
            return;
        }

        const locationObject = {
            lat: finalLat,
            lng: finalLng,
            address: finalAddressString,
            label: finalLabel,
        };

        if (houseNumValue) {
            try {
                if (location) {
                    await editLocation({ locId: location.id, locData: locationObject }).unwrap();
                } else {
                    await addLocation(locationObject).unwrap();
                }
                handleClose();
            } catch (e) {
                console.log(e);
            }
        }
    };

    return (
        <Modal opened={opened} onClose={handleClose} zIndex={1000} size="lg" title={<ModalText title="New address" />}>
            <Box style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "20px" }}>
                <TextInput
                    radius="md"
                    placeholder="Name this location"
                    label="Label"
                    w="100%"
                    ref={labelRef}
                    defaultValue={location?.label ?? ""}
                />
                <Map
                    key={opened ? "map-opened" : "map-closed"}
                    userCoords={userCoords}
                    withSearch={true}
                    onLocationSelect={(lat, lng, address) => {
                        setSelectedLocation({ lat, lng, address });
                        if (address?.house_number) {
                            setHouseNumValue(address.house_number);
                        } else {
                            setHouseNumValue("");
                        }
                    }}
                    selectedLocation={activeLocation}
                />
                <Box w="100%" style={{ display: "flex", gap: "10px" }}>
                    <Box w="100%">
                        <TextInput
                            radius="md"
                            w="100%"
                            label="House number"
                            placeholder="Enter the exact house number"
                            value={houseNumValue}
                            onChange={(e) => {
                                setHouseNumValue(e.currentTarget.value);
                                if (houseNumError) setHouseNumError(false);
                            }}
                            withAsterisk
                            error={houseNumError ? "Please provide your house number" : null}
                        />
                    </Box>
                    <NumberInput
                        radius="md"
                        ref={floorRef}
                        w="100%"
                        label="Floor"
                        placeholder="Enter the floor number"
                        defaultValue={floor}
                        hideControls
                    />
                    <NumberInput
                        radius="md"
                        ref={doorRef}
                        w="100%"
                        label="Door"
                        placeholder="Enter your door number"
                        defaultValue={door}
                        hideControls
                    />
                </Box>
            </Box>
            <Button w={100} radius="md" mt={30} loading={isAddLoading || isEditLoading} onClick={handleSubmit}>
                Add
            </Button>
        </Modal>
    );
}
