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
    Button,
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

    const handleSearch = () => {
        setSearchTerm(localSearch);
        handleClose();
        navigate("/browse/list");
    };

    useWindowEvent("keydown", (event) => {
        if (event.key === "Escape" && opened) {
            handleClose();
        }
        if (event.key === "Enter" && opened) {
            handleSearch();
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

                            backgroundColor:
                                "light-dark(var(--mantine-color-beige-0), var(--mantine-color-midnight-8))",
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
                                <Group
                                    gap="xs"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        navigate("/browse/list");
                                        close();
                                    }}
                                >
                                    <ThemeIcon size="lg" variant="filled" color="blue" radius="md">
                                        <IconShare size={25} />
                                    </ThemeIcon>
                                    <Text
                                        fw={700}
                                        size="xl"
                                        style={{
                                            letterSpacing: "-0.5px",
                                            color: "light-dark(var(--mantine-color-dark-6), white)",
                                        }}
                                        visibleFrom="md"
                                    >
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
                                    <>
                                        <Box
                                            style={{
                                                display: "flex",
                                                flexDirection: "row",
                                                gap: "10px",
                                                overflowX: "auto",
                                                scrollSnapType: "x mandatory",
                                                paddingBottom: "15px",
                                            }}
                                            p={30}
                                        >
                                            {data?.results.map((item) => (
                                                <Box
                                                    key={item.id}
                                                    w="100%"
                                                    maw={300}
                                                    miw={{ base: "60vw", md: 0 }}
                                                    style={{ scrollSnapAlign: "start" }}
                                                >
                                                    <SearchResultItemCard
                                                        item={item}
                                                        onClick={() => handleClick(item.id)}
                                                    />
                                                </Box>
                                            ))}
                                        </Box>
                                        <Button hiddenFrom="md" radius="md" mt={20} w="100%" onClick={handleSearch}>
                                            Search
                                        </Button>
                                    </>
                                )}
                            </Box>
                        </Container>
                    </Box>
                )}
            </Transition>
        </RemoveScroll>
    );
}
