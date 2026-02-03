import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import { resolver, themeOverride } from "./theme.ts";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <MantineProvider theme={themeOverride} defaultColorScheme="dark" cssVariablesResolver={resolver}>
                <App />
            </MantineProvider>
        </Provider>
    </StrictMode>,
);
