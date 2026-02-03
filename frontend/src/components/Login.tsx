import {
    Anchor,
    Box,
    Button,
    Group,
    Paper,
    type PaperProps,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import boxStyles from "../css/Login.module.css";
import { useNavigate } from "react-router-dom";

export function Login(props: PaperProps) {
    const inputColor = 'light-dark(var(--mantine-color-beige-0), var(--mantine-color-gray-9))';
    const navigate = useNavigate();
    const PASSWORD_LENGTH = 6;
    const form = useForm({
        initialValues: {
            email: "",
            password: "",
            terms: true,
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val) =>
                val.length <= PASSWORD_LENGTH
                    ? "Password should include at least 6 characters"
                    : null,
        },
    });

    return (
        <Box className={boxStyles.loginScreen}>
            <Paper w="100%" radius="md" p="lg" withBorder {...props}>
                <Text size="lg" fw={500} c="bright" pb={20}>
                    Welcome back!
                </Text>

                <form noValidate onSubmit={form.onSubmit(() => {})}>
                    <Stack>
                        <TextInput
                            required
                            label="Email"
                            placeholder="test@example.com"
                            value={form.values.email}
                            onChange={(event) =>
                                form.setFieldValue(
                                    "email",
                                    event.currentTarget.value,
                                )
                            }
                            error={form.errors.email && "Invalid email"}
                            radius="md"
                            styles={{
                                input: {
                                    backgroundColor: inputColor
                                }
                            }}
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) =>
                                form.setFieldValue(
                                    "password",
                                    event.currentTarget.value,
                                )
                            }
                            error={
                                form.errors.password &&
                                "Password should include at least 6 characters"
                            }
                            radius="md"
                        />
                    </Stack>

                    <Group justify="space-between" mt="xl">
                        <Anchor
                            component="button"
                            type="button"
                            c="bright"
                            opacity={0.85}
                            onClick={() => navigate("/register")}
                            size="xs"
                        >
                            Don't have an account? Register
                        </Anchor>
                        <Button type="submit" radius="xl">
                            Login
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
}
