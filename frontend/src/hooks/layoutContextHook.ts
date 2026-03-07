import { useOutletContext } from "react-router-dom";
import type { LayoutContext } from "../components/Layout";

export function useLayoutContext() {
    return useOutletContext<LayoutContext>();
}
