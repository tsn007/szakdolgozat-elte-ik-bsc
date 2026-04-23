import { Accordion, Box, Container, UnstyledButton, Text, Flex } from "@mantine/core";
import buttonStyles from "../css/Button.module.css";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useGetAllItemsQuery, type ItemsResponse } from "../redux/itemsApi";
import { filterItems } from "../consts/filterItems";
import { useUserData } from "../hooks/userLocation";
import { useEffect, useState } from "react";
import { useLayoutContext } from "../hooks/layoutContextHook";

export type CoordsType = {
    lat: number;
    lng: number;
};

export type SearchContextType = {
    items: ItemsResponse;
    userCoords: CoordsType | undefined;
    setPage: (newPage: number) => void;
    page: number;
};

export function SearchLayout() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const setPage = (newPage: number) => {
        setSearchParams((prevParams) => {
            prevParams.set("page", newPage.toString());
            return prevParams;
        });
    };
    const MAX_PRICE = 1000;
    const min_price = parseInt(searchParams.get("min_price") || "0", 10);
    const max_price = parseInt(searchParams.get("max_price") || MAX_PRICE.toString(), 10);
    const setPrice = ([newMinPrice, newMaxPrice]: [number, number]) => {
        setSearchParams((prevParams) => {
            prevParams.set("page", "1");
            prevParams.set("min_price", newMinPrice.toString());
            prevParams.set("max_price", newMaxPrice.toString());
            return prevParams;
        });
    };
    const initialCatString = searchParams.get("category");
    const [prevCatString, setPrevCatString] = useState(initialCatString);
    const [localCategories, setLocalCategories] = useState<string[]>(
        initialCatString ? initialCatString.split(",") : [],
    );
    const categories = initialCatString ? initialCatString.split(",") : [];

    if (initialCatString !== prevCatString) {
        setPrevCatString(initialCatString);
        setLocalCategories(initialCatString ? initialCatString.split(",") : []);
    }

    const setCategoryURL = (catName: string) => {
        const isChecked = categories.includes(catName);
        const updatedCategories = isChecked
            ? localCategories.filter((c: string) => c !== catName)
            : [...localCategories, catName];

        setLocalCategories(updatedCategories);

        setSearchParams(
            (prevParams) => {
                prevParams.set("page", "1");
                prevParams.set("category", updatedCategories.join(","));
                return prevParams;
            },
            { replace: true },
        );
    };

    const itemFilters = filterItems.map((item) => {
        const Icon = item.icon;
        const Desc = item.description;
        return (
            <Accordion.Item key={item.value} value={item.value} mb={20}>
                <Accordion.Control icon={<Icon />}>{item.value}</Accordion.Control>
                <Accordion.Panel>
                    {
                        <Desc
                            value={[min_price, max_price]}
                            setValue={setPrice}
                            MAX_PRICE={MAX_PRICE}
                            categories={localCategories}
                            setCategoryURL={setCategoryURL}
                        />
                    }
                </Accordion.Panel>
            </Accordion.Item>
        );
    });
    const { searchTerm } = useLayoutContext();
    const { userCoords, fetchLocation } = useUserData();
    const { data: items } = useGetAllItemsQuery({
        page: page,
        search: searchTerm,
        lat: userCoords?.lat,
        lng: userCoords?.lng,
        min_price: min_price,
        max_price: max_price,
        category: categories,
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    return (
        <>
            <Box
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    gap: "20px",
                }}
                mb={80}
            >
                <UnstyledButton onClick={() => navigate("/browse/list")}>
                    <Text p={5} className={buttonStyles.viewPicker}>
                        Card View
                    </Text>
                </UnstyledButton>
                <UnstyledButton onClick={() => navigate("/browse/map")}>
                    <Text p={5} className={buttonStyles.viewPicker}>
                        Map View
                    </Text>
                </UnstyledButton>
            </Box>
            <Container fluid>
                <Flex
                    direction={{ base: "column", md: "row" }}
                    align={{ base: "stretch", md: "flex-start" }}
                    gap="20px"
                >
                    <Box
                        w={{ base: "100%", md: "15vw" }}
                        miw={220}
                        pos={{ base: "static", md: "sticky" }}
                        top={{ md: 130 }}
                        style={{
                            maxHeight: "calc(100vh - 40px)",
                            overflowY: "auto",
                            scrollbarWidth: "none",
                        }}
                    >
                        <Accordion variant="filled" radius="lg" multiple>
                            {itemFilters}
                        </Accordion>
                    </Box>

                    <Box flex={1} w="100%">
                        {!items || (
                            <Outlet context={{ items, userCoords, setPage, page } satisfies SearchContextType} />
                        )}
                    </Box>
                </Flex>
            </Container>
        </>
    );
}
