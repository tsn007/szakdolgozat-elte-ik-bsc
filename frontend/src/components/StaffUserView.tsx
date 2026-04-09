import { Box, Container, Group, Pagination } from "@mantine/core";
import { useGetAllUsersQuery } from "../redux/userApi";
import { UserDataCard } from "./UserDataCard";
import { useSearchParams } from "react-router-dom";

const PAGE_SIZE = 50;

export function StaffUserView() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const setPage = (newPage: number) => {
        setSearchParams((prevParams) => {
            prevParams.set("page", newPage.toString());
            return prevParams;
        });
    };
    const { data: users } = useGetAllUsersQuery(page);
    const totalPages = Math.ceil((users?.count ?? 0) / PAGE_SIZE);

    return (
        <Container>
            <Box style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {users?.results.map((user) => (
                    <UserDataCard user={user} />
                ))}
            </Box>
            <Group justify="center" pr={50} pt={80} pb={40}>
                <Pagination total={totalPages} radius="md" onChange={setPage} value={page} />
            </Group>
        </Container>
    );
}
