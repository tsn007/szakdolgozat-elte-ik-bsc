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

    const eventHandlers = useMemo(
        () => ({
            async dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    const rawPos = marker.getLatLng();
                    const newAddress = await fetchAddressFromCoords(rawPos.lat, rawPos.lng);

                    onLocationSelect(rawPos.lat, rawPos.lng, newAddress);
                }
            },
        }),
        [onLocationSelect],
    );

    return <Marker draggable={true} eventHandlers={eventHandlers} position={{ lat, lng }} ref={markerRef} />;
}
