import { IconCategoryFilled, IconCurrencyEuro } from "@tabler/icons-react";
import { CategoryFilter } from "../components/CategoryFilter";
import { PriceFilter } from "../components/PriceFilter";

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
];
