import { useOutletContext } from "react-router-dom";
import type { SearchContextType } from "../components/SearchLayout";

export function useSearchContext() {
    return useOutletContext<SearchContextType>();
}
