import {
    Box,
    Container,
    Group,
    TextInput,
    ThemeIcon,
    Text,
    UnstyledButton,
    Transition,
    RemoveScroll,
    Loader,
} from "@mantine/core";
import { SearchResultItemCard } from "./SearchResultItemCard";
import { IconSearch, IconShare } from "@tabler/icons-react";
import textStyles from "../css/Text.module.css";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue, useWindowEvent } from "@mantine/hooks";
import { useGetPreviewItemsQuery } from "../redux/itemsApi";
import { useState } from "react";
import { useUserData } from "../hooks/userLocation";

type SearchResultProps = {
    opened: boolean;
    close: () => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
};

export function SearchResults({ opened, close, searchTerm, setSearchTerm }: SearchResultProps) {
    const navigate = useNavigate();
    const [localSearch, setLocalSearch] = useState(searchTerm);
    const DEBOUNCE_TIME = 500;
    const MIN_QUERY_LENGTH = 3;
    const PAGE = 1;
    const PAGE_SIZE = 5;
    const { userCoords } = useUserData();
    const payload = {
        page: PAGE,
        page_size: PAGE_SIZE,
        search: localSearch,
        lat: userCoords?.lat ?? 0,
        lng: userCoords?.lng ?? 0,
    };
    const [debounced] = useDebouncedValue(payload, DEBOUNCE_TIME);
    const { data, isFetching } = useGetPreviewItemsQuery(debounced, {
        skip: debounced.search.length < MIN_QUERY_LENGTH,
    });

    const handleClose = () => {
        close();
        setLocalSearch("");
    };

    useWindowEvent("keydown", (event) => {
        if (event.key === "Escape" && opened) {
            handleClose();
        }
        if (event.key === "Enter" && opened) {
            setSearchTerm(localSearch);
            handleClose();
            navigate("/browse/list");
        }
    });

    const handleClick = (itemId: string) => {
        handleClose();
        navigate(`/items/${itemId}`);
    };

    return (
        <RemoveScroll enabled={opened}>
            <Transition mounted={opened} transition="slide-down" duration={250} timingFunction="ease">
                {(transitionStyles) => (
                    <Box
                        style={{
                            ...transitionStyles,
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            zIndex: 1005,

                            minHeight: "33vh",
                            maxHeight: "100vh",
                            overflowY: "auto",

                            backgroundColor: "rgba(15, 23, 42, 0.98)",
                            backdropFilter: "blur(10px)",
                            paddingTop: "1.125rem",
                            paddingBottom: "2rem",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        <Container fluid>
                            <Box
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto 1fr",
                                    gap: "10px",
                                    alignItems: "center",
                                    paddingBottom: "20px",
                                }}
                            >
                                <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => navigate("/home")}>
                                    <ThemeIcon size="lg" variant="filled" color="blue" radius="md">
                                        <IconShare size={25} />
                                    </ThemeIcon>
                                    <Text fw={700} size="xl" c="white" style={{ letterSpacing: "-0.5px" }}>
                                        ShareHood
                                    </Text>
                                </Group>

                                <TextInput
                                    w="50vw"
                                    radius="lg"
                                    placeholder="Search"
                                    leftSection={<IconSearch size={20} />}
                                    onChange={(e) => setLocalSearch(e.currentTarget.value)}
                                    data-autofocus
                                />

                                <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <UnstyledButton onClick={handleClose} p="xs">
                                        <Text size="md" fw={500} c="dimmed" className={textStyles.searchCancel}>
                                            Cancel
                                        </Text>
                                    </UnstyledButton>
                                </Box>
                            </Box>

                            <Box style={{ position: "relative", minHeight: "150px" }}>
                                {isFetching && <Loader />}
                                {localSearch.length > 0 && (
                                    <Box style={{ display: "flex", flexDirection: "row", gap: "10px" }} p={30}>
                                        {data?.results.map((item) => (
                                            <SearchResultItemCard
                                                key={item.id}
                                                item={item}
                                                onClick={() => handleClick(item.id)}
                                            />
                                        ))}
                                    </Box>
                                )}
                            </Box>
                        </Container>
                    </Box>
                )}
            </Transition>
        </RemoveScroll>
    );
}
