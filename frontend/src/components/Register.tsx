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

export function Register(props: PaperProps) {
    const navigate = useNavigate();
    const MIN_PASSWORD_LENGTH = 6;
    const MIN_NAME_LENGTH = 2;
    const form = useForm({
        initialValues: {
            email: "",
            name: "",
            password: "",
            passwordagain: "",
            terms: true,
        },

        validate: {
            name: (val) => {
                if (/\d/.test(val)) {
                    return "Your name should not contain numbers";
                }

                if (val.length < MIN_NAME_LENGTH) {
                    return "Your name should be at least 2 characters long";
                }
                return null;
            },
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val) =>
                val.length <= MIN_PASSWORD_LENGTH
                    ? "Password should include at least 6 characters"
                    : null,
            passwordagain: (val, values) =>
                val !== values.password ? "The passwords must match" : null,
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
                            label="Name"
                            placeholder="Your name"
                            value={form.values.name}
                            onChange={(event) =>
                                form.setFieldValue(
                                    "name",
                                    event.currentTarget.value,
                                )
                            }
                            error={form.errors.name}
                            radius="md"
                        />
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
                        <PasswordInput
                            required
                            label="Password again"
                            placeholder="Confirm your password"
                            value={form.values.passwordagain}
                            onChange={(event) =>
                                form.setFieldValue(
                                    "passwordagain",
                                    event.currentTarget.value,
                                )
                            }
                            error={
                                form.errors.passwordagain &&
                                "Password must match"
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
                            onClick={() => navigate("/login")}
                            size="xs"
                        >
                            Already have an account? Login
                        </Anchor>
                        <Button type="submit" radius="xl">
                            Register
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
}
