/* eslint-disable no-magic-numbers */
import { Avatar, Box, Container, Flex, Rating, Text } from "@mantine/core";
import { useGetUserReviewsQuery } from "../redux/userApi";
import { useState } from "react";

const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) {
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    if (hours > 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (minutes > 0) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    return "Just now";
};

export function Reviews() {
    const { data: reviews } = useGetUserReviewsQuery();
    const [now] = useState(() => Date.now());

    return (
        <Container p={20}>
            {(!reviews || reviews.length === 0) && (
                <Container style={{ display: "flex", justifyContent: "center" }}>
                    <Text>No reviews yet</Text>
                </Container>
            )}
            {reviews?.map((review) => {
                const createdAt = new Date(review.created_at);
                const ms = now - createdAt.getTime();
                return (
                    <Container
                        key={review.id}
                        fluid
                        mb={40}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}
                    >
                        <Flex align="flex-start" gap={10}>
                            <Avatar src={review.sender.profile_pic} />
                            <Box>
                                <Box style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Text
                                        size="md"
                                        fw={500}
                                    >{`${review.sender.first_name} ${review.sender.last_name}`}</Text>
                                    <Text c="dimmed" size="sm">
                                        {formatTime(ms)}
                                    </Text>
                                </Box>
                                <Text size="md">{review.content}</Text>
                            </Box>
                        </Flex>
                        <Rating fractions={10} readOnly value={Number(review.point || 0)}></Rating>
                    </Container>
                );
            })}
        </Container>
    );
}
