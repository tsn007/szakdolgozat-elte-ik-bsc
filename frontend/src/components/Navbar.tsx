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
    Tooltip,
    useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import {
    IconMessageCircle,
    IconLogout,
    IconSearch,
    IconShare,
    IconX,
    IconBan,
    IconSun,
    IconMoon,
} from "@tabler/icons-react";
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
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const toggleVal = colorScheme === "light" ? "dark" : "light";

    const links = isGuest
        ? [
              { title: "Features", to: "#features" },
              { title: "How it works", to: "#how-it-works" },
          ]
        : [];

    const handleLogout = () => {
        apiLogout();
        dispatch(logout());
    };

    return (
        <Box
            component="nav"
            className={boxStyles.navbarMain}
            style={{
                backgroundColor: isScrolled
                    ? "light-dark(color-mix(in srgb, var(--mantine-color-beige-1) 60%, transparent), color-mix(in srgb, var(--mantine-color-midnight-8) 60%, transparent))"
                    : "transparent",
                backdropFilter: isScrolled ? "blur(20px)" : "none",
                borderBottom: isScrolled
                    ? `1px solid light-dark(var(--mantine-color-beige-0), var(--mantine-color-dark-7))`
                    : "none",
            }}
        >
            <Container fluid>
                <Group justify="space-between" align="center" pl={10} pr={10} style={{ position: "relative" }}>
                    <Group gap={50}>
                        <Group gap="xs" style={{ cursor: "pointer" }} onClick={() => navigate("/browse/list")}>
                            <ThemeIcon size="lg" variant="filled" color="blue" radius="md">
                                <IconShare size={25} />
                            </ThemeIcon>
                            <Text
                                fw={700}
                                size="xl"
                                c={colorScheme === "dark" ? "white" : "var(--mantine-color-dark-6)"}
                                style={{ letterSpacing: "-0.5px" }}
                                visibleFrom="md"
                            >
                                ShareHood
                            </Text>
                        </Group>

                        <Group gap="md" visibleFrom="md">
                            {links.map((link) =>
                                isGuest ? (
                                    <Text component="a" key={link.title} href={link.to} fw={500}>
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
                        <>
                            <Box
                                visibleFrom="md"
                                style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
                            >
                                <TextInput
                                    w={500}
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
                            </Box>
                            <Group>
                                {isAuthenticated ? (
                                    <Box style={{ display: "flex", gap: "15px" }}>
                                        <Tooltip label="Messages">
                                            <Avatar radius="xl" onClick={() => navigate("/message-hub")}>
                                                <IconMessageCircle />
                                            </Avatar>
                                        </Tooltip>
                                        <Menu radius="md" trigger="hover" position="bottom-end" zIndex={1000}>
                                            <Menu.Target>
                                                <Avatar visibleFrom="md" radius="xl" src={user?.profile_pic} />
                                            </Menu.Target>
                                            <Menu.Dropdown visibleFrom="md">
                                                {user?.is_staff && (
                                                    <>
                                                        <Menu.Label>Staff</Menu.Label>
                                                        <Menu.Item
                                                            leftSection={<IconBan />}
                                                            onClick={() => navigate("/users")}
                                                        >
                                                            Ban users
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                    </>
                                                )}
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
                                                <Menu.Item
                                                    leftSection={colorScheme === "dark" ? <IconSun /> : <IconMoon />}
                                                    onClick={() => setColorScheme(toggleVal)}
                                                >{`${toggleVal.charAt(0).toUpperCase() + toggleVal.slice(1)} mode`}</Menu.Item>
                                                <Menu.Item
                                                    leftSection={<IconLogout />}
                                                    color="red"
                                                    onClick={handleLogout}
                                                >
                                                    Logout
                                                </Menu.Item>
                                            </Menu.Dropdown>
                                        </Menu>
                                    </Box>
                                ) : (
                                    <Box visibleFrom="md" style={{ display: "flex", gap: "10px" }}>
                                        <Button variant="outline" radius="md" onClick={() => navigate("/register")}>
                                            Sign up
                                        </Button>
                                        <Button radius="md" onClick={() => navigate("/login")}>
                                            Login
                                        </Button>
                                    </Box>
                                )}
                            </Group>
                        </>
                    )}

                    <Burger opened={mobileNavOpen} onClick={mobileNavToggle} hiddenFrom="md" />
                </Group>
            </Container>

            <Drawer
                opened={mobileNavOpen}
                onClose={mobileNavClose}
                size="100%"
                padding="md"
                title="Menu"
                hiddenFrom="md"
                zIndex={1000}
            >
                <Stack gap="md" mt="xl">
                    {!isGuest && (
                        <TextInput
                            placeholder="Search"
                            radius="lg"
                            readOnly
                            onClick={() => {
                                searchOpen();
                                mobileNavClose();
                            }}
                            leftSection={<IconSearch size={20} />}
                            value={searchTerm}
                        />
                    )}

                    {links.map((link) => (
                        <Text
                            className={textStyles.navbarLinks}
                            key={link.title}
                            component={Link}
                            to={link.to}
                            size="lg"
                            fw={500}
                            onClick={mobileNavClose}
                            c="white"
                        >
                            {link.title}
                        </Text>
                    ))}

                    {!isGuest && isAuthenticated ? (
                        <>
                            <Text size="sm" fw={700} c="dimmed" mt="md">
                                Account
                            </Text>

                            {user?.is_staff && (
                                <Button
                                    variant="subtle"
                                    color="gray"
                                    justify="flex-start"
                                    leftSection={<IconBan size={20} />}
                                    onClick={() => {
                                        navigate("/users");
                                        mobileNavClose();
                                    }}
                                >
                                    Ban Users
                                </Button>
                            )}

                            {profileMenuData.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Button
                                        key={item.title}
                                        variant="subtle"
                                        color="gray"
                                        justify="flex-start"
                                        leftSection={<Icon size={20} />}
                                        onClick={() => {
                                            navigate(item.to);
                                            mobileNavClose();
                                        }}
                                    >
                                        {item.title}
                                    </Button>
                                );
                            })}

                            <Button
                                variant="subtle"
                                color="gray"
                                justify="flex-start"
                                leftSection={colorScheme === "dark" ? <IconSun size={20} /> : <IconMoon size={20} />}
                                onClick={() => setColorScheme(toggleVal)}
                            >
                                {`${toggleVal.charAt(0).toUpperCase() + toggleVal.slice(1)} mode`}
                            </Button>

                            <Button
                                variant="filled"
                                color="red"
                                mt="xl"
                                leftSection={<IconLogout size={20} />}
                                onClick={() => {
                                    handleLogout();
                                    mobileNavClose();
                                }}
                                radius="md"
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Stack gap="sm" mt="md">
                            <Button
                                fullWidth
                                size="lg"
                                radius="md"
                                color="blue"
                                onClick={() => {
                                    navigate("/register");
                                    mobileNavClose();
                                }}
                            >
                                Get Started
                            </Button>
                            {!isAuthenticated && (
                                <Button
                                    fullWidth
                                    variant="outline"
                                    size="lg"
                                    radius="md"
                                    onClick={() => {
                                        navigate("/login");
                                        mobileNavClose();
                                    }}
                                >
                                    Login
                                </Button>
                            )}
                        </Stack>
                    )}
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
