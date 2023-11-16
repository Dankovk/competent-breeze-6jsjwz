import React from "react";
import { createRoot } from "react-dom/client";
import { StyleSheetManager } from "styled-components";
import { App } from "./components/App";
import { type StoreType } from "./store/store";

export const DocumentContext = React.createContext<Document | null>(null);

export const initReact = (store: Partial<StoreType>, container: HTMLDivElement, styleContainer: HTMLDivElement) => {
    createRoot(container).render(
        <DocumentContext.Provider value={store.documentRef as unknown as Document}>
            <StyleSheetManager target={styleContainer}>
                <App />
            </StyleSheetManager>
        </DocumentContext.Provider>
    );
};
