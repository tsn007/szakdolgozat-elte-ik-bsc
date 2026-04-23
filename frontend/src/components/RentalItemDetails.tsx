/* eslint-disable no-magic-numbers */
import {
    Box,
    Container,
    Divider,
    Paper,
    Stepper,
    Text,
    Image,
    Avatar,
    AspectRatio,
    Button,
    Tooltip,
    Flex,
    Group,
} from "@mantine/core";
import { useChangeStatusMutation, type Rental } from "../redux/reservationsApi";
import { STEPPERS } from "../consts/stepperStates";
import { IconCheck, IconMapPinFilled, IconMessageCircle } from "@tabler/icons-react";
import { RESERVATION_STATUS, type ReservationStatus } from "../utils/rentalStatus";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { AddReviewModal } from "./AddReviewModal";
import { getApiErrorMessage } from "../utils/errors";
import { showCustomNotification } from "../utils/notifications";
import { useNavigate } from "react-router-dom";

export function RentalItemDetails({ rental }: { rental: Rental }) {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 48em)");
    const [opened, { open, close }] = useDisclosure(false);
    const [changeStatus] = useChangeStatusMutation();
    const flow = STEPPERS[rental.status || "PENDING"];
    const res_from = new Date(rental.from_date);
    const res_to = new Date(rental.to_date);
    const differenceInMs = res_to.getTime() - res_from.getTime();
    // eslint-disable-next-line no-magic-numbers
    const msInADay = 1000 * 60 * 60 * 24;
    const differenceInDays = differenceInMs / msInADay;
    const nextStatus =
        rental.status === RESERVATION_STATUS.ACCEPTED
            ? RESERVATION_STATUS.IN_PROGRESS
            : RESERVATION_STATUS.RETURN_PENDING;

    const handleChange = async (new_status: ReservationStatus) => {
        const statusObj = {
            id: rental.id,
            status: new_status,
        };

        try {
            await changeStatus(statusObj).unwrap();
        } catch (e) {
            showCustomNotification({
                id: "server-error",
                title: "Error",
                message: getApiErrorMessage(e),
                type: "error",
            });
        }
    };

    return (
        <Container fluid>
            <Paper w="100%" p={{ base: "md", sm: 20 }} radius="lg">
                <Stepper active={flow.active} color="teal" size="sm" orientation={isMobile ? "vertical" : "horizontal"}>
                    {flow.steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === flow.active;
                        return (
                            <Stepper.Step
                                key={index}
                                label={step.label}
                                description={step.description}
                                icon={
                                    Icon ? (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                width: "100%",
                                                height: "100%",
                                            }}
                                        >
                                            <Icon size={isMobile ? 16 : 20} color={flow.stepColor} />
                                        </div>
                                    ) : undefined
                                }
                                color={isActive ? flow.stepColor : undefined}
                            />
                        );
                    })}
                    <Stepper.Completed>The rental has been successfully completed!</Stepper.Completed>
                </Stepper>
            </Paper>

            <Paper radius="lg" mt={20} p={{ base: "md", sm: 20 }}>
                <Flex direction={{ base: "column", sm: "row" }} gap={{ base: "md", sm: "xl" }} justify="space-between">
                    <Flex gap="md" align={{ base: "flex-start", sm: "center" }}>
                        <AspectRatio ratio={1 / 1} w={{ base: 80, sm: 150 }} style={{ flexShrink: 0 }}>
                            <Image src={rental.item.cover} radius="lg" />
                        </AspectRatio>

                        <Box style={{ flex: 1 }}>
                            <Text fw={600} size="sm" mb={{ base: "xs", sm: 0 }} hiddenFrom="sm">
                                {rental.item.name}
                            </Text>

                            <Group gap="sm" mb={8} wrap="nowrap" align="flex-end">
                                <Avatar src={rental.item.owner.profile_pic} size={isMobile ? "sm" : "lg"} />
                                <Text fz={{ base: "sm", sm: "lg" }} fw={500} style={{ wordBreak: "break-word" }} mb={5}>
                                    {rental.item.owner.first_name + " " + rental.item.owner.last_name}
                                </Text>
                            </Group>

                            <Group gap={6} wrap="nowrap">
                                <IconMapPinFilled size={25} color="red" style={{ flexShrink: 0 }} />
                                <Text fz={{ base: "xs", sm: "md" }} c="dimmed" lh={1.2}>
                                    {rental.item.location.address}
                                </Text>
                            </Group>
                        </Box>
                    </Flex>

                    <Flex
                        direction="column"
                        justify="space-between"
                        align={{ base: "stretch", sm: "flex-end" }}
                        gap="md"
                    >
                        <Text w="100%" ta="right" fw={500} size="xl" visibleFrom="sm">
                            {rental.item.name}
                        </Text>

                        <Box style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                            {(rental.status === RESERVATION_STATUS.ACCEPTED ||
                                rental.status === RESERVATION_STATUS.IN_PROGRESS) && (
                                <Flex direction={{ base: "column", xs: "row" }} gap="10px" justify="flex-end">
                                    <Tooltip
                                        label="Can not message yourself!"
                                        disabled={rental.renter !== rental.item.owner.id}
                                    >
                                        <Button
                                            fullWidth={isMobile} // Mobilon kitölti a teret
                                            onClick={() => navigate(`/message-hub?rental=${rental.id}`)}
                                            radius="md"
                                            color="blue"
                                            leftSection={<IconMessageCircle size={16} />}
                                            disabled={rental.renter === rental.item.owner.id}
                                        >
                                            Message Owner
                                        </Button>
                                    </Tooltip>
                                    <Button
                                        fullWidth={isMobile}
                                        radius="md"
                                        color="teal"
                                        leftSection={<IconCheck size={16} />}
                                        onClick={() => handleChange(nextStatus)}
                                    >
                                        {rental.status === RESERVATION_STATUS.ACCEPTED
                                            ? "Got the item"
                                            : "Returned the item"}
                                    </Button>
                                </Flex>
                            )}

                            {rental.status === RESERVATION_STATUS.COMPLETED && (
                                <>
                                    <Tooltip
                                        label="Can not review yourself!"
                                        disabled={rental.renter !== rental.item.owner.id}
                                    >
                                        <Button
                                            fullWidth={isMobile}
                                            variant="light"
                                            radius="md"
                                            onClick={open}
                                            disabled={rental.renter === rental.item.owner.id}
                                        >
                                            Leave a review
                                        </Button>
                                    </Tooltip>
                                    <AddReviewModal opened={opened} close={close} rentalId={rental.id} />
                                </>
                            )}
                        </Box>
                    </Flex>
                </Flex>

                <Divider my={15} />

                <Flex
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    direction={{ base: "column", sm: "row" }}
                    gap="xs"
                >
                    <Text size="md" c="dimmed">
                        Total price (for {differenceInDays > 0 ? Math.ceil(differenceInDays) : 1} days):
                    </Text>
                    <Box style={{ alignSelf: isMobile ? "flex-end" : "auto" }}>
                        <Text ta="right" size="30px" fw={700}>
                            {rental.total_price} €
                        </Text>
                    </Box>
                </Flex>
            </Paper>
        </Container>
    );
}
