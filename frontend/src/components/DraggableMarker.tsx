import { useRef, useMemo } from "react";
import { Marker } from "react-leaflet";
import type { AddressType } from "./MapSearchBar";
import { fetchAddressFromCoords } from "../hooks/userLocation";

type MarkerProps = {
    lat: number;
    lng: number;
    onLocationSelect: (lat: number, lng: number, address: AddressType | null) => void;
};

export function DraggableMarker({ lat, lng, onLocationSelect }: MarkerProps) {
    const markerRef = useRef<L.Marker>(null);
    const MAX_NUMBER_OF_DIGITS = 6;

    const eventHandlers = useMemo(
        () => ({
            async dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const rawPos = marker.getLatLng();
                    const trimmedLat = Number(rawPos.lat.toFixed(MAX_NUMBER_OF_DIGITS));
                    const trimmedLng = Number(rawPos.lng.toFixed(MAX_NUMBER_OF_DIGITS));

                    const newAddress = await fetchAddressFromCoords(trimmedLat, trimmedLng);

                    onLocationSelect(trimmedLat, trimmedLng, newAddress);
                }
            },
        }),
        [onLocationSelect],
    );

    return <Marker draggable={true} eventHandlers={eventHandlers} position={{ lat, lng }} ref={markerRef} />;
}
