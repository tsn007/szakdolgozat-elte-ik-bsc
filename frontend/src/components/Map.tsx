import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import mapStyles from "../css/Map.module.css";
import type { Item, ItemsResponse } from "../redux/itemsApi";
import type { CoordsType } from "./SearchLayout";
import { Button, Skeleton } from "@mantine/core";
import { ItemCard } from "./ItemCard";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapSearchBar, type AddressType } from "./MapSearchBar";
import { DraggableMarker } from "./DraggableMarker";

type MapProps = {
    items?: ItemsResponse;
    item?: Item;
    userCoords?: CoordsType | undefined;
    withSearch?: boolean;
    onLocationSelect?: (lat: number, lng: number, address: AddressType | null) => void;
    selectedLocation?: { lat: number; lng: number; address?: AddressType | null | undefined } | null;
};

export function Map({ items, item, userCoords, withSearch, onLocationSelect, selectedLocation }: MapProps) {
    const itemLat = parseFloat(item?.location.lat ?? "0");
    const itemLng = parseFloat(item?.location.lng ?? "0");
    const canLoadMap = userCoords || item || selectedLocation;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${itemLat},${itemLng}`;
    const height = item || !items ? "300px" : "80vh";

    return !canLoadMap ? (
        <Skeleton height={height} radius="lg" />
    ) : (
        <MapContainer
            center={
                userCoords
                    ? [userCoords.lat, userCoords.lng]
                    : item
                      ? [itemLat, itemLng]
                      : selectedLocation
                        ? [selectedLocation.lat, selectedLocation.lng]
                        : // eslint-disable-next-line no-magic-numbers
                          [2, 2]
            }
            zoom={13}
            scrollWheelZoom
            style={{ height: height }}
            className={mapStyles.map}
        >
            <TileLayer url="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" />

            {withSearch && onLocationSelect && <MapSearchBar onLocationSelect={onLocationSelect} />}
            {selectedLocation && (
                <DraggableMarker
                    lat={selectedLocation.lat}
                    lng={selectedLocation.lng}
                    onLocationSelect={onLocationSelect || (() => {})}
                />
            )}

            {item && (
                <Button
                    component="a"
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    pos="absolute"
                    top={20}
                    right={20}
                    style={{ zIndex: 1000, color: "white" }}
                    radius="md"
                >
                    Open in Google Maps
                </Button>
            )}
            {items && items.results.length > 0 && (
                <MarkerClusterGroup>
                    {items.results.map((item) => (
                        <Marker key={item.id} position={[Number(item.location.lat), Number(item.location.lng)]}>
                            <Popup className={mapStyles.customPopup}>
                                <ItemCard item={item} isMapPopup={true} />
                            </Popup>
                        </Marker>
                    ))}
                </MarkerClusterGroup>
            )}
            {item && <Marker key={item.id} position={[Number(item.location.lat), Number(item.location.lng)]}></Marker>}
        </MapContainer>
    );
}
