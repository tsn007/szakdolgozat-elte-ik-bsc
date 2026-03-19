import { Box, Checkbox, Collapse, Text } from "@mantine/core";
import { useGetAllCategoryQuery } from "../redux/categoryApi";
import { useDisclosure } from "@mantine/hooks";

export function CategoryFilter({
    categories,
    setCategoryURL,
}: {
    categories: string[];
    setCategoryURL: (val: string) => void;
}) {
    const VISIBLE_CATS = 5;
    const { data } = useGetAllCategoryQuery();
    const [opened, { toggle }] = useDisclosure(false);
    const visibleData = data?.slice(0, VISIBLE_CATS) || [];
    const hiddenData = data?.slice(VISIBLE_CATS) || [];

    return (
        <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {visibleData.map((cat) => (
                <Checkbox
                    key={cat.id}
                    label={cat.name}
                    checked={categories.includes(cat.name)}
                    onChange={() => setCategoryURL(cat.name)}
                    styles={{
                        input: { cursor: "pointer" },
                    }}
                />
            ))}

            <Collapse in={opened}>
                <Box style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {hiddenData?.map((cat) => (
                        <Checkbox
                            key={cat.id}
                            label={cat.name}
                            checked={categories.includes(cat.name)}
                            onChange={() => setCategoryURL(cat.name)}
                            styles={{
                                input: { cursor: "pointer" },
                            }}
                        />
                    ))}
                </Box>
            </Collapse>

            {hiddenData.length > 0 && (
                <Text onClick={toggle} style={{ cursor: "pointer", color: "gray" }}>
                    {opened ? "Less" : "More"}
                </Text>
            )}
        </Box>
    );
}
