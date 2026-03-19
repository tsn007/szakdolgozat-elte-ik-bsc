import { useCallback, useState } from "react";
import type { CoordsType } from "../components/SearchLayout";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

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

export const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        console.log(data);
        return data.address || null;
    } catch (error) {
        console.error(error);
    }
};

export const useUserData = () => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [userCoords, setUserCoords] = useState<CoordsType>();

    const fetchLocation = useCallback(() => {
        return new Promise<CoordsType | null>((resolve) => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                        setUserCoords(coords);
                        resolve(coords);
                    },
                    async () => {
                        const locData = await fetchFallbackLocation();
                        if (locData && !locData.error) {
                            const coords = { lat: locData.latitude, lng: locData.longitude };
                            setUserCoords(coords);
                            resolve(coords);
                        } else {
                            resolve(null);
                        }
                    },
                );
            } else {
                resolve(null);
            }
        });
    }, []);

    return {
        user,
        userCoords,
        fetchLocation,
        fetchAddressFromCoords,
    };
};
