import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/nprogress/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "leaflet/dist/leaflet.css";
import { MantineProvider, localStorageColorSchemeManager } from "@mantine/core";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { resolver, themeOverride } from "./theme.ts";
import { NavigationProgress } from "@mantine/nprogress";
import { Notifications } from "@mantine/notifications";

const colorSchemeManager = localStorageColorSchemeManager({
    key: "colorScheme",
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <MantineProvider
                theme={themeOverride}
                colorSchemeManager={colorSchemeManager}
                defaultColorScheme="dark"
                cssVariablesResolver={resolver}
            >
                <Notifications />
                <NavigationProgress />
                <App />
            </MantineProvider>
        </Provider>
    </StrictMode>,
);
