import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import mapStyles from "../css/Map.module.css";
import type { ItemsResponse } from "../redux/itemsApi";
import type { CoordsType } from "./SearchLayout";
import { Box, Text } from "@mantine/core";
import { ItemCard } from "./ItemCard";
import MarkerClusterGroup from "react-leaflet-cluster";

export function Map({ items, userCoords }: { items: ItemsResponse; userCoords: CoordsType | undefined }) {
    return !userCoords ? (
        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Text>Loading map...</Text>{" "}
        </Box>
    ) : (
        <MapContainer center={[userCoords.lat, userCoords.lng]} zoom={13} scrollWheelZoom className={mapStyles.map}>
            <TileLayer url="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png" />
            <MarkerClusterGroup>
                {items.results.map((item) => (
                    <Marker key={item.id} position={[Number(item.location.lat), Number(item.location.lng)]}>
                        <Popup className={mapStyles.customPopup}>
                            <ItemCard item={item} isMapPopup={true} />
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
}
