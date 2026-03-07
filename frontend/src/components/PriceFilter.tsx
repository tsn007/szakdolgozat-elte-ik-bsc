import { Box, RangeSlider, Text } from "@mantine/core";
import { useState } from "react";

type PriceFilterProps = {
    value: [number, number];
    setValue: (val: [number, number]) => void;
    MAX_PRICE: number;
};

export function PriceFilter({ value, setValue, MAX_PRICE }: PriceFilterProps) {
    const [localValue, setLocalValue] = useState<[number, number]>(value);
    return (
        <Box>
            <Text>
                EUR {localValue[0]} - EUR {localValue[1]}
            </Text>
            <RangeSlider
                value={localValue}
                onChange={setLocalValue}
                onChangeEnd={setValue}
                defaultValue={[0, MAX_PRICE]}
                label={null}
                step={10}
                pushOnOverlap={false}
                max={MAX_PRICE}
            />
        </Box>
    );
}
