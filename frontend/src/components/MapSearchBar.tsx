/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

export type AddressType = {
    city?: string;
    town?: string;
    village?: string;
    road: string;
    house_number: string;
    postcode: string;
    country: string;
};

type SearchBarProps = {
    onLocationSelect: (lat: number, lng: number, address: AddressType) => void;
};

export function MapSearchBar({ onLocationSelect }: SearchBarProps) {
    const map = useMap();

    useEffect(() => {
        const provider = new OpenStreetMapProvider({
            params: {
                addressdetails: 1,
            },
        });

        const searchControl = new (GeoSearchControl as any)({
            provider: provider,
            style: "bar",
            showMarker: false,
            showPopup: false,
            autoClose: false,
            searchLabel: "Search for an address...",
        });

        map.addControl(searchControl);

        map.on("geosearch/showlocation", (result: any) => {
            const rawAddress = result.location.raw.address || {};
            onLocationSelect(result.location.y, result.location.x, rawAddress);
        });

        return () => {
            map.removeControl(searchControl);
        };
    }, [map, onLocationSelect]);

    return null;
}
