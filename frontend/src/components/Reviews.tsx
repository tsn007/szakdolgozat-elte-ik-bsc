import { Avatar, Box, Container, Flex, Rating, Text } from "@mantine/core";
import { useGetUserReviewsQuery } from "../redux/userApi";
import { useState } from "react";
import { formatTime } from "../utils/functions";

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
