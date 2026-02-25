import {
    Box,
    Container,
    Group,
    Button,
    Burger,
    Drawer,
    Stack,
    Text,
    ThemeIcon,
    //Autocomplete,
    Avatar,
    TextInput,
    Modal,
    UnstyledButton,
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { IconSearch, IconShare } from "@tabler/icons-react";
import boxStyles from "../css/Box.module.css";
import textStyles from "../css/Text.module.css";
import { useNavigate } from "react-router-dom";
//import { useSelector } from "react-redux";
//import type { RootState } from "../redux/store";

export const Navbar = ({ isGuest }: { isGuest: boolean }) => {
    //const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const SCROLL_THRESHOLD = 20;
    const [mobileNavOpen, { toggle: mobileNavToggle, close: mobileNavClose }] =
        useDisclosure(false);
    const [scroll] = useWindowScroll();
    const isScrolled = scroll.y > SCROLL_THRESHOLD;
    const navigate = useNavigate();
    const [modalOpened, { open: modalOpen, close: modalClose }] =
        useDisclosure(false);

    const links = isGuest ? ["Features", "How it Works"] : ["Home"];

    return (
        <Box
            component="nav"
            className={boxStyles.navbarMain}
            style={{
                backgroundColor: isScrolled
                    ? "rgba(15, 23, 42, 0.9)"
                    : "transparent",
                backdropFilter: isScrolled ? "blur(10px)" : "none",
                borderBottom: isScrolled
                    ? `1px solid rgba(30, 41, 59, 0.5)`
                    : "none",
            }}
        >
            <Container fluid>
                <Group justify="space-between" align="center" pl={10} pr={10}>
                    <Group
                        gap="xs"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate("/home")}
                    >
                        <ThemeIcon
                            size="lg"
                            variant="filled"
                            color="blue"
                            radius="md"
                        >
                            <IconShare size={25} />
                        </ThemeIcon>
                        <Text
                            fw={700}
                            size="xl"
                            c="white"
                            style={{ letterSpacing: "-0.5px" }}
                        >
                            ShareHood
                        </Text>
                    </Group>

                    <Group gap="md" visibleFrom="md">
                        {links.map((link) => (
                            <Text
                                className={textStyles.navbarLinks}
                                key={link}
                                component="a"
                                href={
                                    isGuest
                                        ? `#${link.toLowerCase().replace(/\s+/g, "-")}`
                                        : ""
                                }
                                size="sm"
                                fw={500}
                            >
                                {link}
                            </Text>
                        ))}
                        {isGuest && (
                            <Button
                                radius="xl"
                                size="md"
                                color="blue"
                                variant="filled"
                                styles={{
                                    root: {
                                        boxShadow:
                                            "0 10px 15px -3px rgba(30, 64, 175, 0.3)",
                                    },
                                }}
                                onClick={() => navigate("/register")}
                            >
                                Get Started
                            </Button>
                        )}
                    </Group>

                    {!isGuest && (
                        <Group>
                            <TextInput
                                placeholder="Search"
                                radius="lg"
                                readOnly
                                onClick={modalOpen}
                                leftSection={<IconSearch size={20} />}
                            />
                            <Avatar radius="xl" />
                            <Avatar radius="xl" />
                        </Group>
                    )}

                    <Burger
                        opened={mobileNavOpen}
                        onClick={mobileNavToggle}
                        hiddenFrom="md"
                        color="white"
                    />
                </Group>
            </Container>

            <Drawer //mobile navbar!!!
                opened={mobileNavOpen}
                onClose={mobileNavClose}
                size="100%"
                padding="md"
                title="Menu"
                hiddenFrom="md"
                styles={{
                    header: { backgroundColor: "#0f172a", color: "white" },
                    content: { backgroundColor: "#0f172a", color: "white" },
                    close: { color: "white" },
                }}
            >
                <Stack gap="md" mt="xl">
                    {links.map((link) => (
                        <Text
                            className={textStyles.navbarLinks}
                            key={link}
                            component="a"
                            href="#"
                            size="lg"
                            fw={500}
                            onClick={mobileNavClose}
                        >
                            {link}
                        </Text>
                    ))}
                    <Button
                        fullWidth
                        size="lg"
                        radius="md"
                        color="blue"
                        onClick={mobileNavClose}
                    >
                        Get Started
                    </Button>
                </Stack>
            </Drawer>
            <Modal
                opened={modalOpened}
                onClose={modalClose}
                size="100%"
                xOffset={0}
                yOffset={0}
                zIndex={1000}
                transitionProps={{ transition: "slide-down", duration: 250 }}
                withCloseButton={false}
                styles={{
                    content: {
                        height: "33vh",
                        display: "flex",
                        flexDirection: "column",
                    },
                }}
            >
                <Container fluid>
                    <Box
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto 1fr",
                            gap: "10px",
                            alignItems: "center",
                        }}
                    >
                        <Group
                            gap="xs"
                            style={{ cursor: "pointer" }}
                            onClick={() => navigate("/home")}
                        >
                            <ThemeIcon
                                size="lg"
                                variant="filled"
                                color="blue"
                                radius="md"
                            >
                                <IconShare size={25} />
                            </ThemeIcon>
                            <Text
                                fw={700}
                                size="xl"
                                c="white"
                                style={{ letterSpacing: "-0.5px" }}
                            >
                                ShareHood
                            </Text>
                        </Group>
                        <TextInput
                            w="50vw"
                            radius="lg"
                            placeholder="Search"
                            leftSection={<IconSearch size={20} />}
                        />
                        <Box
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                            }}
                        >
                            <UnstyledButton onClick={modalClose} p="xs">
                                <Text
                                    size="md"
                                    fw={500}
                                    c="dimmed"
                                    className={textStyles.searchCancel}
                                >
                                    Cancel
                                </Text>
                            </UnstyledButton>
                        </Box>
                    </Box>
                </Container>
            </Modal>
        </Box>
    );
};
