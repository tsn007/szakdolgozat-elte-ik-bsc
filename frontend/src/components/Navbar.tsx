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
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { IconShare } from "@tabler/icons-react";
import boxStyles from "../css/Box.module.css";
import textStyles from "../css/Text.module.css";
import { useNavigate } from "react-router-dom";
//import { useSelector } from 'react-redux';
//import type { RootState } from '../redux/store';

export const Navbar = ({ isGuest }: { isGuest: boolean }) => {
    //const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const SCROLL_THRESHOLD = 20;
    const [opened, { toggle, close }] = useDisclosure(false);
    const [scroll] = useWindowScroll();
    const isScrolled = scroll.y > SCROLL_THRESHOLD;
    const navigate = useNavigate();

    const links = isGuest
        ? ["Features", "How it Works"]
        : ["Home", "Reservations"];

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
            <Container size="lg">
                <Group justify="space-between" align="center">
                    <Group gap="xs" style={{ cursor: "pointer" }}>
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

                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="md"
                        color="white"
                    />
                </Group>
            </Container>

            <Drawer //mobile navbar!!!
                opened={opened}
                onClose={close}
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
                            onClick={close}
                        >
                            {link}
                        </Text>
                    ))}
                    <Button
                        fullWidth
                        size="lg"
                        radius="md"
                        color="blue"
                        onClick={close}
                    >
                        Get Started
                    </Button>
                </Stack>
            </Drawer>
        </Box>
    );
};
