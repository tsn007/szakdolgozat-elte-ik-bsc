import {
    Anchor,
    Button,
    Container,
    Group,
    Paper,
    type PaperProps,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../redux/authApi";

interface RegisterFormValues {
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
}

export function Register(props: PaperProps) {
    const [register, { isLoading }] = useRegisterMutation();
    const navigate = useNavigate();
    const MIN_PASSWORD_LENGTH = 6;
    const MIN_NAME_LENGTH = 2;
    const form = useForm<RegisterFormValues>({
        initialValues: {
            email: "",
            first_name: "",
            last_name: "",
            password: "",
            password_confirmation: "",
            terms: true,
        },

        validate: {
            first_name: (val) => {
                if (/\d/.test(val)) {
                    return "The name should not contain numbers";
                }

                if (val.length < MIN_NAME_LENGTH) {
                    return "The name should be at least 2 characters long";
                }
                return null;
            },
            last_name: (val) => {
                if (/\d/.test(val)) {
                    return "The name should not contain numbers";
                }

                if (val.length < MIN_NAME_LENGTH) {
                    return "The name should be at least 2 characters long";
                }
                return null;
            },
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val) =>
                val.length <= MIN_PASSWORD_LENGTH ? "Password should include at least 6 characters" : null,
            password_confirmation: (val, values) => (val !== values.password ? "The passwords must match" : null),
        },
    });

    const handleRegister = async (values: RegisterFormValues) => {
        try {
            await register(values).unwrap();
            navigate("/login");
        } catch (error) {
            const message = (error as { data?: { error?: string } })?.data?.error || "Something went wrong!";
            form.setErrors({ email: true, password: message });
        }
    };

    return (
        <Container size="sm" mt={{ base: 0, md: 20 }}>
            <Paper w="100%" radius="md" p="lg" withBorder {...props}>
                <Text size="lg" fw={500} c="bright" pb={20}>
                    Welcome!
                </Text>

                <form noValidate onSubmit={form.onSubmit(handleRegister)}>
                    <Stack>
                        <TextInput
                            required
                            label="First Name"
                            placeholder="First name"
                            value={form.values.first_name}
                            onChange={(event) => form.setFieldValue("first_name", event.currentTarget.value)}
                            error={form.errors.first_name}
                            radius="md"
                        />
                        <TextInput
                            required
                            label="Last Name"
                            placeholder="Last name"
                            value={form.values.last_name}
                            onChange={(event) => form.setFieldValue("last_name", event.currentTarget.value)}
                            error={form.errors.last_name}
                            radius="md"
                        />
                        <TextInput
                            required
                            label="Email"
                            placeholder="test@example.com"
                            value={form.values.email}
                            onChange={(event) => form.setFieldValue("email", event.currentTarget.value)}
                            error={form.errors.email && "Invalid email"}
                            radius="md"
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            value={form.values.password}
                            onChange={(event) => form.setFieldValue("password", event.currentTarget.value)}
                            error={form.errors.password && "Password should include at least 6 characters"}
                            radius="md"
                        />
                        <PasswordInput
                            required
                            label="Password again"
                            placeholder="Confirm your password"
                            value={form.values.password_confirmation}
                            onChange={(event) => form.setFieldValue("password_confirmation", event.currentTarget.value)}
                            error={form.errors.password_confirmation && "Passwords must match"}
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
                        <Button type="submit" radius="xl" loading={isLoading}>
                            Register
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Container>
    );
}
