import { Container, Box, Text, Title, Button, Image, Grid, ThemeIcon, Card, SimpleGrid, Timeline } from "@mantine/core";
import { features, steps } from "../consts";
import { useNavigate } from "react-router-dom";

export function LandingPage() {
    const navigate = useNavigate();
    return (
        <>
            <Container fluid style={{ display: "flex", justifyContent: "space-around" }} pb={80}>
                <Box>
                    <Title
                        order={1}
                        size="4.5rem"
                        fw={800}
                        c="white"
                        lh={1.1}
                        mb="md"
                        style={{ letterSpacing: "-2px" }}
                    >
                        Share More.{" "}
                        <Text span inherit variant="gradient" gradient={{ from: "blue", to: "teal", deg: 45 }}>
                            <br />
                            Waste Less.
                        </Text>
                    </Title>
                    <Text size="xl" c="dimmed" lh={1.6} mb="xl" maw={500}>
                        Why buy what you only use once? Borrow tools, gear, and appliances from trusted neighbors. Save
                        money and help the planet.
                    </Text>
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
                        onClick={() => navigate("/browse/list")}
                    >
                        Check out the catalog
                    </Button>
                </Box>
                <Box visibleFrom="md">
                    <Grid maw="40vw">
                        <Grid.Col span={6}>
                            <Image radius="lg" src="../drill.webp" />
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Image radius="lg" src="../drill.webp" />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Image radius="lg" src="../drill.webp" />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Image radius="lg" src="../drill.webp" />
                        </Grid.Col>
                        <Grid.Col span={4}>
                            <Image radius="lg" src="../drill.webp" />
                        </Grid.Col>
                    </Grid>
                </Box>
            </Container>
            <Container p={50} bg="#0f172a" fluid id="features" style={{ scrollMarginTop: "70px" }}>
                <Box
                    pb={50}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <Title order={2} size={36} fw={800} c="white" mb="sm">
                        Everything you need, <br />
                        <Text span c="blue" inherit>
                            right in your neighborhood.
                        </Text>
                    </Title>
                    <Text size="lg" c="dimmed">
                        ShareHood makes it safe and easy to share household items, saving you money and reducing
                        clutter.
                    </Text>
                </Box>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            padding="xl"
                            radius="lg"
                            bg="#020617"
                            withBorder
                            style={{
                                borderColor: "rgba(30, 41, 59, 0.5)",
                                height: "100%",
                                transition: "all 0.3s ease",
                                cursor: "default",
                                "&:hover": {
                                    borderColor: "rgba(51, 65, 85, 0.8)",
                                    transform: "translateY(-5px)",
                                },
                            }}
                        >
                            <ThemeIcon size={48} radius="md" color={feature.color} variant="light" mb="lg">
                                <feature.icon size={24} />
                            </ThemeIcon>
                            <Title order={3} size="h4" c="white" mb="sm">
                                {feature.title}
                            </Title>
                            <Text c="dimmed" lh={1.6}>
                                {feature.description}
                            </Text>
                        </Card>
                    ))}
                </SimpleGrid>
            </Container>
            <Container
                pt={80}
                bg="linear-gradient(to right, transparent, rgba(30, 41, 59, 0.5), transparent)"
                id="how-it-works"
            >
                <Grid justify="center">
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Box mb={48}>
                            <Title order={2} size={48} fw={800} c="white" mb="md" lh={1.1}>
                                Simple as <br />
                                <Text span c="blue" inherit>
                                    One, Two, Three.
                                </Text>
                            </Title>
                            <Text size="lg" c="dimmed" maw={500}>
                                Getting started with ShareHood takes less than 2 minutes.
                            </Text>
                        </Box>

                        <Timeline active={1} bulletSize={48} lineWidth={2} color="blue">
                            {steps.map((step, index) => (
                                <Timeline.Item
                                    key={index}
                                    bullet={
                                        <ThemeIcon
                                            size={48}
                                            radius="xl"
                                            color="dark"
                                            variant="filled"
                                            style={{
                                                border: "1px solid rgba(51, 65, 85, 0.5)",
                                            }}
                                        >
                                            <step.icon size={20} color="#3b82f6" />
                                        </ThemeIcon>
                                    }
                                    title={
                                        <Text size="xl" fw={700} c="white" mt={-8} mb={4}>
                                            {step.title}
                                        </Text>
                                    }
                                >
                                    <Text c="dimmed" size="md" maw={400} mb="xl">
                                        {step.description}
                                    </Text>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Grid.Col>
                </Grid>
            </Container>
        </>
    );
}
