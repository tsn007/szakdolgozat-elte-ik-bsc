import { useSearchContext } from "../hooks/searchContextHook";
import { Map } from "./Map";

export function MapView() {
    const { items, userCoords } = useSearchContext();
    return (
        <>
            <Map items={items} userCoords={userCoords} />
        </>
    );
}
