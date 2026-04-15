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
import { useLoginMutation } from "../redux/authApi";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { chatApi } from "../redux/chatApi";

interface LoginFormValues {
    email: string;
    password: string;
    terms: boolean;
}

export function Login(props: PaperProps) {
    const [login, { isLoading }] = useLoginMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const form = useForm<LoginFormValues>({
        initialValues: {
            email: "",
            password: "",
            terms: true,
        },

        validate: {
            email: (val) => (/^\S+@\S+$/.test(val) ? null : "Invalid email"),
            password: (val) => (val.length === 0 ? "Please provide your password" : null)
        },
    });

    const handleLogin = async (values: LoginFormValues) => {
        try {
            const result = await login(values).unwrap();
            dispatch(setUser(result.user));
            dispatch(chatApi.util.resetApiState());
            navigate("/browse/list");
        } catch (error) {
            const message = (error as { data?: { error?: string } })?.data?.error || "Something went wrong!";
            form.setErrors({ email: true, password: message });
        }
    };

    return (
        <Box className={boxStyles.loginScreen}>
            <Paper w="100%" radius="md" p="lg" withBorder {...props}>
                <Text size="lg" fw={500} c="bright" pb={20}>
                    Welcome back!
                </Text>

                <form noValidate onSubmit={form.onSubmit(handleLogin)}>
                    <Stack>
                        <TextInput
                            required
                            label="Email"
                            placeholder="test@example.com"
                            {...form.getInputProps("email")}
                            radius="md"
                        />

                        <PasswordInput
                            required
                            label="Password"
                            placeholder="Your password"
                            {...form.getInputProps("password")}
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
                        <Button type="submit" radius="xl" loading={isLoading}>
                            Login
                        </Button>
                    </Group>
                </form>
            </Paper>
        </Box>
    );
}
