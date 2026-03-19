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
    Avatar,
    TextInput,
    Menu,
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { IconHeart, IconLogout, IconSearch, IconShare, IconX } from "@tabler/icons-react";
import boxStyles from "../css/Box.module.css";
import textStyles from "../css/Text.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { profileMenuData } from "../consts/profileMenuItems";
import { useLogoutMutation } from "../redux/authApi";
import { logout } from "../redux/authSlice";
import { SearchResults } from "./SearchResults";
import type { Dispatch, SetStateAction } from "react";
import iconStyles from "../css/Icon.module.css";
import { useUserData } from "../hooks/userLocation";

type NavbarProps = {
    isGuest: boolean;
    searchOpened: boolean;
    searchClose: () => void;
    searchOpen: () => void;
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
};

export const Navbar = ({ isGuest, searchOpened, searchClose, searchOpen, searchTerm, setSearchTerm }: NavbarProps) => {
    const [apiLogout] = useLogoutMutation();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const dispatch = useDispatch();
    const { user } = useUserData();
    const SCROLL_THRESHOLD = 20;
    const [mobileNavOpen, { toggle: mobileNavToggle, close: mobileNavClose }] = useDisclosure(false);
    const [scroll] = useWindowScroll();
    const isScrolled = scroll.y > SCROLL_THRESHOLD;
    const navigate = useNavigate();

    const links = isGuest
        ? [
              { title: "Features", to: "#features" },
              { title: "How it works", to: "#how-it-works" },
          ]
        : [
              { title: "Home", to: "/browse/list" },
              { title: "Map", to: "/browse/map" },
              { title: "Categories", to: "/browse/list" },
          ];

    const handleLogout = () => {
        apiLogout();
        dispatch(logout());
    };

    return (
        <Box
            component="nav"
            className={boxStyles.navbarMain}
            style={{
                backgroundColor: isScrolled ? "rgba(15, 23, 42, 0.9)" : "transparent",
                backdropFilter: isScrolled ? "blur(10px)" : "none",
                borderBottom: isScrolled ? `1px solid rgba(30, 41, 59, 0.5)` : "none",
            }}
        >
            <Container fluid>
                <Group justify="space-between" align="center" pl={10} pr={10}>
                    <Group gap={50}>
                        <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => navigate("/browse/list")}>
                            <ThemeIcon size="lg" variant="filled" color="blue" radius="md">
                                <IconShare size={25} />
                            </ThemeIcon>
                            <Text fw={700} size="xl" c="white" style={{ letterSpacing: "-0.5px" }}>
                                ShareHood
                            </Text>
                        </Group>

                        <Group gap="md" visibleFrom="md">
                            {links.map((link) =>
                                isGuest ? (
                                    <Text component="a" key={link.title} href={link.to} c="rgb(171, 171, 171)" fw={500}>
                                        {link.title}
                                    </Text>
                                ) : (
                                    <Link
                                        className={textStyles.navbarLinks}
                                        key={link.title}
                                        to={isGuest ? `#${link.to}` : link.to}
                                    >
                                        {link.title}
                                    </Link>
                                ),
                            )}
                        </Group>
                    </Group>

                    {isGuest && (
                        <Button
                            radius="xl"
                            size="md"
                            color="blue"
                            variant="filled"
                            styles={{
                                root: {
                                    boxShadow: "0 10px 15px -3px rgba(30, 64, 175, 0.3)",
                                },
                            }}
                            onClick={() => navigate("/register")}
                        >
                            Get Started
                        </Button>
                    )}

                    {!isGuest && (
                        <Group>
                            <TextInput
                                placeholder="Search"
                                radius="lg"
                                readOnly
                                onClick={searchOpen}
                                leftSection={<IconSearch size={20} />}
                                rightSection={
                                    <IconX
                                        size={20}
                                        onClick={() => setSearchTerm("")}
                                        className={iconStyles.searchReset}
                                    />
                                }
                                value={searchTerm}
                            />
                            {isAuthenticated ? (
                                <Box style={{ display: "flex", gap: "15px" }}>
                                    <Avatar radius="xl">
                                        <IconHeart />
                                    </Avatar>
                                    <Menu radius="md" trigger="hover" position="bottom-end" zIndex={1000}>
                                        <Menu.Target>
                                            <Avatar radius="xl" src={user?.profile_pic} />
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                            {profileMenuData.map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Menu.Item
                                                        key={item.title}
                                                        leftSection={<Icon />}
                                                        onClick={() => navigate(item.to)}
                                                    >
                                                        {item.title}
                                                    </Menu.Item>
                                                );
                                            })}
                                            <Menu.Divider />
                                            <Menu.Item leftSection={<IconLogout />} color="red" onClick={handleLogout}>
                                                Logout
                                            </Menu.Item>
                                        </Menu.Dropdown>
                                    </Menu>
                                </Box>
                            ) : (
                                <Box style={{ display: "flex", gap: "10px" }}>
                                    <Button variant="outline" radius="md" onClick={() => navigate("/register")}>
                                        Sign up
                                    </Button>
                                    <Button radius="md" onClick={() => navigate("/login")}>
                                        Login
                                    </Button>
                                </Box>
                            )}
                        </Group>
                    )}

                    <Burger opened={mobileNavOpen} onClick={mobileNavToggle} hiddenFrom="md" color="white" />
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
                            key={link.title}
                            component="a"
                            href="#"
                            size="lg"
                            fw={500}
                            onClick={mobileNavClose}
                        >
                            {link.title}
                        </Text>
                    ))}
                    <Button fullWidth size="lg" radius="md" color="blue" onClick={mobileNavClose}>
                        Get Started
                    </Button>
                </Stack>
            </Drawer>
            <SearchResults
                opened={searchOpened}
                close={searchClose}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
        </Box>
    );
};
