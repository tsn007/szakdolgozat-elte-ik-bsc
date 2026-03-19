import { useOutletContext } from "react-router-dom";
import type { ProfileContextType } from "../components/ProfilePage";

export function useProfileContext() {
    return useOutletContext<ProfileContextType>();
}
