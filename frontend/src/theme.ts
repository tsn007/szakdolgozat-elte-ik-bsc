/* eslint-disable no-magic-numbers */
import { createTheme, type CSSVariablesResolver, type MantineColorsTuple } from "@mantine/core";

const beige: MantineColorsTuple = [
    "#fcfaf2",
    "#f5f0db",
    "#ede4bc",
    "#e4d699",
    "#dbca77",
    "#d4bd5b",
    "#cdaa42",
    "#b29336",
    "#9e822f",
    "#8a7128",
];

const midnight: MantineColorsTuple = [
    "#e6e9ef",
    "#b3bccd",
    "#808fab",
    "#4d6289",
    "#264071",
    "#0a2351",
    "#081c41",
    "#061531",
    "#040e21",
    "#020710",
];

export const themeOverride = createTheme({
    colors: {
        beige,
        midnight,
    },
    fontFamily: "Rubik, sans-serif",
    headings: {
        fontFamily: "Rubik, sans-serif",
    },
});

const resolver: CSSVariablesResolver = (theme) => ({
    variables: {},
    light: {
        "--mantine-color-body": theme.colors.beige[0],
        "--mantine-color-text": "#2c2c2c",
    },
    dark: {
        "--mantine-color-body": theme.colors.midnight[9],
        "--mantine-color-text": theme.colors.gray[0],
    },
});

export { resolver };
