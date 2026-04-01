/* eslint-disable no-magic-numbers */
import {
    AspectRatio,
    Avatar,
    Box,
    Button,
    Card,
    Container,
    Divider,
    Group,
    Image,
    Rating,
    Text,
    Badge,
    Overlay,
    Paper,
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

export function ItemDetailsPage() {
    const { user } = useUserData();
    const [createRes, { isLoading }] = useCreateReservationMutation();
    const [dates, setDates] = useState<[string | null, string | null]>([null, null]);
    const { itemId } = useParams();
    const { data: item } = useGetItemByIdQuery(itemId ?? "", { skip: !itemId });
    const [embla, setEmbla] = useState<EmblaCarouselType | null>(null);
    const slideBgColor = "var(--mantine-color-dark-5)";
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
                <Container pb={50} size="lg" style={{ display: "flex", gap: "70px", alignItems: "flex-start" }}>
                    <Box w={500} style={{ position: "sticky", top: "95px" }}>
                        <Carousel
                            w={500}
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
                        <Group justify="center" mt={-30} pos="relative" bottom={35} left={175}>
                            <IconArrowLeft
                                size={40}
                                onClick={() => handlePrev(selectedIndex)}
                                className={iconStyles.stepper}
                            />
                            <IconArrowRight
                                size={40}
                                onClick={() => handleNext(selectedIndex)}
                                className={iconStyles.stepper}
                            />
                        </Group>
                        <Box style={{ display: "flex", gap: "10px", width: "100%", justifyContent: "center" }}>
                            <Carousel withControls={false} w="100%" slideSize="1%">
                                {allImgs.map((img, index) => {
                                    const isActive = index === selectedIndex;

                                    return (
                                        <Carousel.Slide key={img.id} py="sm" px="5px">
                                            <AspectRatio ratio={1 / 1} className="prevent-select">
                                                <Image
                                                    src={img.image}
                                                    radius="lg"
                                                    w={80}
                                                    className={carouselStyles.preview}
                                                    onClick={() => handleSelect(index)}
                                                    style={{
                                                        outline: isActive ? "2px solid white" : "",
                                                        outlineOffset: isActive ? "2px" : "",
                                                    }}
                                                />
                                            </AspectRatio>
                                        </Carousel.Slide>
                                    );
                                })}
                            </Carousel>
                        </Box>
                    </Box>
                    <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }} w="100%">
                        <Card radius="lg" withBorder>
                            <Card.Section
                                px={50}
                                pt={40}
                                pb={20}
                                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                            >
                                <Text size="35px" fw={500}>
                                    {item?.name}
                                </Text>
                                <Text size="lg" c="dimmed">
                                    {item?.category.name}
                                </Text>
                                <Box style={{ display: "flex", alignItems: "flex-end" }}>
                                    <Text fw={400} size="30px">
                                        {item?.price + "€"}
                                    </Text>
                                    <Text c="dimmed">/day</Text>
                                </Box>
                            </Card.Section>
                            <Card.Section
                                px={20}
                                my={20}
                                bg="black"
                                style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}
                            >
                                <Box pos="relative">
                                    <Badge size="xl" mt={20} fullWidth color="var(--mantine-color-midnight-6)">
                                        Choose a date
                                    </Badge>
                                    <DatePicker
                                        type="range"
                                        value={dates}
                                        onChange={setDates}
                                        minDate={new Date()}
                                        size="md"
                                        my={30}
                                        w="100%"
                                        maxDate={getDynamicMaxDate()}
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
                                        excludeDate={isExcluded}
                                    />
                                    {!user && (
                                        <Overlay
                                            color="#000"
                                            backgroundOpacity={0.35}
                                            blur={5}
                                            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
                                        >
                                            <Paper
                                                w="50%"
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
                                px={40}
                                pb={40}
                                pt={20}
                                style={{ display: "flex", flexDirection: "column", gap: "10px" }}
                            >
                                <Button
                                    size="lg"
                                    radius="xl"
                                    onClick={handleReserve}
                                    loading={isLoading}
                                    disabled={!user}
                                >
                                    Rent this item
                                </Button>
                                <Button size="lg" radius="xl" variant="outline">
                                    Add to favourites
                                </Button>
                            </Card.Section>
                        </Card>
                        <Card radius="lg">
                            <Box style={{ display: "flex", gap: "10px" }}>
                                <Avatar src={item?.owner.profile_pic} />
                                <Box>
                                    <Text>{item?.owner.first_name + " " + item?.owner.last_name}</Text>
                                    <Box style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <Rating fractions={10} readOnly value={Number(item?.owner?.rating || 0)} />
                                        <Text c="dimmed" fs="italic" size="sm">
                                            {`(${item?.owner.rating_count} reviews)`}
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                            <Divider my={20} />
                            <Text fw={500} size="lg">
                                More from this user
                            </Text>
                        </Card>
                        <Box mb={40}>
                            <Map key={item?.id} item={item} />
                        </Box>
                    </Box>
                </Container>
            </Container>
        </>
    );
}
