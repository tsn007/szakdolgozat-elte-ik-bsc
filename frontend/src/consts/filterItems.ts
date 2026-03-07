import { IconCategoryFilled, IconCurrencyEuro, IconCloudCheck } from "@tabler/icons-react";
import { CategoryFilter } from "../components/CategoryFilter";
import { PriceFilter } from "../components/PriceFilter";
import { AvailabilityFilter } from "../components/AvailabilityFilter";

export const filterItems = [
    {
        icon: IconCategoryFilled,
        value: "Category",
        description: CategoryFilter,
    },
    {
        icon: IconCurrencyEuro,
        value: "Price",
        description: PriceFilter,
    },
    {
        icon: IconCloudCheck,
        value: "Availability",
        description: AvailabilityFilter,
    },
];
