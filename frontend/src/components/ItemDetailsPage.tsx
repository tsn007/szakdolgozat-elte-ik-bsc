/* eslint-disable no-magic-numbers */
import {
    AspectRatio,
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Group,
    Image,
    Rating,
    Text,
    Badge,
    Overlay,
    Paper,
    Flex,
    Divider,
} from "@mantine/core";
import { useParams } from "react-router-dom";
import { useGetItemByIdQuery } from "../redux/itemsApi";
import { Carousel } from "@mantine/carousel";
import { useMemo, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";
import carouselStyles from "../css/Carousel.module.css";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import iconStyles from "../css/Icon.module.css";
import { DatePicker } from "@mantine/dates";
import { Map } from "./Map";
import { useCreateReservationMutation } from "../redux/reservationsApi";
import { showCustomNotification } from "../utils/notifications";
import { getApiErrorMessage } from "../utils/errors";
import { useUserData } from "../hooks/userLocation";
import { formatTime } from "../utils/functions";

export function ItemDetailsPage() {
    const [now] = useState(() => Date.now());
    const { user } = useUserData();
    const [createRes, { isLoading }] = useCreateReservationMutation();
    const [dates, setDates] = useState<[string | null, string | null]>([null, null]);
    const { itemId } = useParams();
    const { data: item } = useGetItemByIdQuery(itemId ?? "", { skip: !itemId });
    const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
    const slideBgColor = "light-dark(var(--mantine-color-beige-1), var(--mantine-color-dark-5))";
    const [selectedIndex, setSelectedIndex] = useState(0);
    const allImgs = useMemo(() => {
        if (!item) return [];

        const coverImage = {
            id: "cover",
            image: item.cover,
        };

        return [coverImage, ...item.images];
    }, [item]);

    const handleSelect = (idx: number) => {
        embla?.scrollTo(idx, true);
        setSelectedIndex(idx);
    };

    const handleNext = (idx: number) => {
        embla?.scrollNext(true);
        if (selectedIndex < allImgs.length - 1) {
            setSelectedIndex(idx + 1);
        }
    };

    const handlePrev = (idx: number) => {
        embla?.scrollPrev(true);
        if (selectedIndex > 0) {
            setSelectedIndex(idx - 1);
        }
    };

    const isExcluded = (calendarDate: string) => {
        if (!item?.reservations || item.reservations.length === 0) {
            return false;
        }

        const date = new Date(calendarDate);
        return item.reservations.some((res) => {
            const from = new Date(res.from_date);
            const to = new Date(res.to_date);

            return date >= from && date <= to;
        });
    };

    const getDynamicMaxDate = () => {
        const selectedStart = dates[0];
        const selectedEnd = dates[1];

        if (selectedStart && !selectedEnd && item?.reservations) {
            const futureBookings = item.reservations
                .map((res) => new Date(res.from_date))
                .filter((fromDate) => fromDate > new Date(selectedStart));

            if (futureBookings.length > 0) {
                const nextBookingDate = new Date(Math.min(...futureBookings.map((d) => d.getTime())));

                const maxAvailableDay = new Date(nextBookingDate);
                maxAvailableDay.setDate(maxAvailableDay.getDate() - 1);

                return maxAvailableDay;
            }
        }
        return undefined;
    };

    const handleReserve = async () => {
        if (!itemId || !dates[0] || !dates[1]) {
            showCustomNotification({
                id: "no-date-error",
                title: "Missing information",
                message: "Please choose the dates of the reservation",
                type: "error",
            });
            return;
        }

        try {
            await createRes({
                item: itemId,
                from_date: new Date(dates[0]).toISOString(),
                to_date: new Date(dates[1]).toISOString(),
            }).unwrap();

            setDates([null, null]);
            showCustomNotification({
                id: "reservation-success",
                title: "Success",
                message: "Request submitted. You'll be notified when the owner replies.",
                type: "success",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            showCustomNotification({
                id: "server-error",
                title: "Error",
                message: getApiErrorMessage(error),
                type: "error",
            });
        }
    };

    return (
        <>
            <Container size="lg">
                <Flex direction={{ base: "column", md: "row" }} gap={{ base: "xl", md: 70 }} pb={50} align="flex-start">
                    <Box w={{ base: "100%", md: 500 }} pos={{ base: "static", md: "sticky" }} top={95}>
                        <Box pos="relative" w="100%">
                            <Carousel
                                w="100%"
                                getEmblaApi={setEmbla}
                                emblaOptions={{ watchDrag: false }}
                                withControls={false}
                                className="prevent-select"
                            >
                                {allImgs.map((img) => (
                                    <Carousel.Slide key={img.id}>
                                        <AspectRatio ratio={4 / 3}>
                                            <Image radius="lg" src={img.image} fit="contain" bg={slideBgColor} />
                                        </AspectRatio>
                                    </Carousel.Slide>
                                ))}
                            </Carousel>

                            <Group gap="xs" pos="absolute" bottom={15} right={15} style={{ zIndex: 10 }}>
                                <IconArrowLeft
                                    size={40}
                                    onClick={() => handlePrev(selectedIndex)}
                                    className={iconStyles.stepper}
                                    color="light-dark(var(--mantine-color-white), black)"
                                    style={{ cursor: "pointer" }}
                                />
                                <IconArrowRight
                                    size={40}
                                    onClick={() => handleNext(selectedIndex)}
                                    className={iconStyles.stepper}
                                    color="light-dark(var(--mantine-color-white), black)"
                                    style={{ cursor: "pointer" }}
                                />
                            </Group>
                        </Box>

                        <Box style={{ width: "100%" }}>
                            <Carousel withControls={false} w="100%" slideSize="auto" slideGap="sm">
                                {allImgs.map((img, index) => {
                                    const isActive = index === selectedIndex;
                                    return (
                                        <Carousel.Slide key={img.id} py="sm" px={5}>
                                            <Image
                                                src={img.image}
                                                radius="lg"
                                                w={80}
                                                h={80}
                                                fit="cover"
                                                className={carouselStyles.preview}
                                                onClick={() => handleSelect(index)}
                                                style={{
                                                    cursor: "pointer",
                                                    outline: isActive
                                                        ? "2px solid light-dark(var(--mantine-color-midnight-6), white)"
                                                        : "none",
                                                    outlineOffset: isActive ? "2px" : "0",
                                                }}
                                            />
                                        </Carousel.Slide>
                                    );
                                })}
                            </Carousel>
                        </Box>
                    </Box>

                    <Box style={{ flex: 1, minWidth: 0 }} w="100%">
                        <Flex direction="column" gap="md" w="100%">
                            <Card radius="lg" withBorder>
                                <Card.Section
                                    px={{ base: 20, md: 50 }}
                                    pt={{ base: 20, md: 40 }}
                                    pb={20}
                                    style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                                >
                                    <Text size="35px" fw={500} lh={1.2}>
                                        {item?.name}
                                    </Text>
                                    <Text size="lg" c="dimmed">
                                        {item?.category.name}
                                    </Text>
                                    <Box style={{ display: "flex", alignItems: "flex-end" }}>
                                        <Text fw={400} size="30px">
                                            {item?.price + "€"}
                                        </Text>
                                        <Text c="dimmed" mb={4}>
                                            /day
                                        </Text>
                                    </Box>
                                </Card.Section>

                                <Card.Section
                                    px={{ base: 10, md: 20 }}
                                    my={20}
                                    bg="light-dark(var(--mantine-color-beige-1), black)"
                                    style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}
                                >
                                    <Box pos="relative" p={{ base: 10, md: 20 }}>
                                        <Badge
                                            size="xl"
                                            mt={{ base: 0, md: 20 }}
                                            fullWidth
                                            color="var(--mantine-color-midnight-6)"
                                        >
                                            Choose a date
                                        </Badge>
                                        <DatePicker
                                            type="range"
                                            value={dates}
                                            onChange={setDates}
                                            minDate={new Date()}
                                            size="md"
                                            my={{ base: 15, md: 30 }}
                                            w="100%"
                                            maxDate={getDynamicMaxDate()}
                                            excludeDate={isExcluded}
                                            styles={{
                                                calendarHeader: { width: "100%", maxWidth: "100%" },

                                                day: {
                                                    width: "100%",
                                                    height: "40px",
                                                    borderRadius: "var(--mantine-radius-md)",
                                                    fontSize: "var(--mantine-font-size-md)",
                                                },

                                                month: { width: "100%", tableLayout: "fixed" },
                                                monthsList: { width: "100%", tableLayout: "fixed" },
                                                yearsList: { width: "100%", tableLayout: "fixed" },
                                                monthsListControl: {
                                                    width: "100%",
                                                    height: "45px",
                                                    borderRadius: "var(--mantine-radius-md)",
                                                },
                                                yearsListControl: {
                                                    width: "100%",
                                                    height: "45px",
                                                    borderRadius: "var(--mantine-radius-md)",
                                                },
                                            }}
                                        />
                                        {!user && (
                                            <Overlay
                                                color="#000"
                                                backgroundOpacity={0.35}
                                                blur={5}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "center",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Paper
                                                    w={{ base: "90%", sm: "50%" }}
                                                    p={20}
                                                    radius="lg"
                                                    shadow="md"
                                                    style={{
                                                        backgroundColor: `light-dark(
                                                    var(--mantine-color-red-0), 
                                                    color-mix(in srgb, var(--mantine-color-dark-8) 85%, var(--mantine-color-red-9))
                                                )`,
                                                    }}
                                                >
                                                    <Text ta="center">You have to be logged in to rent this item!</Text>
                                                </Paper>
                                            </Overlay>
                                        )}
                                    </Box>
                                </Card.Section>

                                <Card.Section
                                    px={{ base: 20, md: 40 }}
                                    pb={{ base: 20, md: 40 }}
                                    pt={{ base: 10, md: 20 }}
                                >
                                    <Button
                                        size="lg"
                                        radius="xl"
                                        fullWidth
                                        onClick={handleReserve}
                                        loading={isLoading}
                                        disabled={!user}
                                    >
                                        Rent this item
                                    </Button>
                                </Card.Section>
                            </Card>

                            <Box mb={40} mt={10}>
                                <Map key={item?.id} item={item} />
                            </Box>
                        </Flex>
                    </Box>
                </Flex>

                <Text fw={500} size="xl" mb={15} ml={10}>
                    About the owner
                </Text>
                <Card radius="lg" mb={40} p={{ base: "md", md: "lg" }}>
                    <Flex align="center" gap="md" wrap="wrap">
                        <Avatar src={item?.owner.profile_pic} size="lg" />
                        <Box>
                            <Text size="lg" fw={500}>
                                {item?.owner.first_name + " " + item?.owner.last_name}
                            </Text>
                            <Flex gap="sm" align="center" wrap="wrap">
                                <Rating fractions={10} readOnly value={Number(item?.owner?.rating || 0)} />
                                <Text c="dimmed" fs="italic" size="sm">
                                    {`(${item?.owner.rating_count} reviews)`}
                                </Text>
                            </Flex>
                        </Box>
                    </Flex>

                    <Divider my={20} />

                    <Box>
                        {item?.reviews.length === 0 && (
                            <Text w="100%" ta="center" fs="italic" c="dimmed">
                                No reviews to show!
                            </Text>
                        )}
                        {item?.reviews?.map((review) => {
                            const createdAt = new Date(review.created_at);
                            const ms = now - createdAt.getTime();
                            return (
                                <Flex
                                    key={review.id}
                                    mb={40}
                                    w="100%"
                                    direction={{ base: "column-reverse", sm: "row" }}
                                    justify="space-between"
                                    align={{ base: "flex-start", sm: "center" }}
                                    gap={{ base: "xs", sm: "xl" }}
                                >
                                    <Flex align="flex-start" gap={10}>
                                        <Avatar src={review.sender.profile_pic} />
                                        <Box>
                                            <Flex align="center" gap={10} wrap="wrap">
                                                <Text size="md" fw={500}>
                                                    {`${review.sender.first_name} ${review.sender.last_name}`}
                                                </Text>
                                                <Text c="dimmed" size="sm">
                                                    {formatTime(ms)}
                                                </Text>
                                            </Flex>
                                            <Text size="md" mt={4}>
                                                {review.content}
                                            </Text>
                                        </Box>
                                    </Flex>
                                    <Rating fractions={10} readOnly value={Number(review.point || 0)} />
                                </Flex>
                            );
                        })}
                    </Box>
                </Card>
            </Container>
        </>
    );
}
