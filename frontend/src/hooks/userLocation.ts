import { useCallback, useState } from "react";
import type { CoordsType } from "../components/SearchLayout";

const fetchFallbackLocation = async () => {
    try {
        const resp = await fetch("https://ipapi.co/json/");
        const data = await resp.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch fallback location: ", error);
        return null;
    }
};

export const useUserLocation = () => {
    const [userCoords, setUserCoords] = useState<CoordsType>();

    const fetchLocation = useCallback(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                async () => {
                    const locData = await fetchFallbackLocation();

                    if (locData && !locData.error) {
                        setUserCoords({
                            lat: locData.latitude,
                            lng: locData.longitude,
                        });
                    }
                },
            );
        }
    }, []);

    return {
        userCoords,
        fetchLocation,
    };
};
