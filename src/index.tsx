import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import {
    ColDef,
    FilterChangedEvent,
    ICellRendererParams,
    IFloatingFilterParams,
    IFloatingFilterParent,
} from "@ag-grid-community/core";
import { ModuleRegistry } from "@ag-grid-community/core";
import {
    AgGridReact,
    IFloatingFilterReactComp,
} from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";
import React from "react";
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { createRoot } from "react-dom/client";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import "react-tabs/style/react-tabs.css";

import books from "./books.json";
import "./index.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const MyFloatingFilter = forwardRef((props: IFloatingFilterParams, ref) => {
    const [currentValue, setCurrentValue] = useState<boolean | undefined>(
        undefined,
    );
    const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

    function onChange() {
        const newValue =
            currentValue === true
                ? false
                : currentValue === false
                ? undefined
                : true;
        setCurrentValue(newValue);
        props.parentFilterInstance((instance: IFloatingFilterParent) => {
            if (newValue === undefined) {
                instance.onFloatingFilterChanged(null, null);
            } else {
                instance.onFloatingFilterChanged(
                    newValue ? "true" : "false",
                    null,
                );
            }
        });
    }

    useImperativeHandle(ref, (): IFloatingFilterReactComp => {
        return {
            onParentModelChanged(parentModel: FilterChangedEvent) {
                if (parentModel) {
                    setCurrentValue(parentModel.type === "true");
                } else {
                    setCurrentValue(undefined);
                }
            },
        };
    });

    React.useEffect(() => {
        const el = inputRef.current;
        if (el == null) {
            return;
        }
        if (currentValue === true) {
            el.checked = true;
            el.indeterminate = false;
        } else if (currentValue === false) {
            el.checked = false;
            el.indeterminate = false;
        } else {
            el.checked = false;
            el.indeterminate = true;
        }
    }, [inputRef, currentValue]);

    return (
        <>
            <input
                ref={inputRef}
                type="checkbox"
                value={"on"}
                onChange={onChange}
            />
        </>
    );
});

function BookCover({ data }: ICellRendererParams) {
    return (
        <a href={`https://covers.openlibrary.org/b/ISBN/${data.isbn}-L.jpg `}>
            <img
                src={`https://covers.openlibrary.org/b/ISBN/${data.isbn}-S.jpg `}
                className="cover"
                alt="Book cover"
            />
        </a>
    );
}

function BookTable({ owned }: { owned: boolean }) {
    const data = React.useMemo(
        () => books.filter((book) => book.owned === owned),
        [owned],
    );

    const columns: ColDef<typeof books[0]>[] = React.useMemo(
        () => [
            {
                cellRenderer: BookCover,
                minWidth: 30,
                maxWidth: 30,
                cellStyle: { paddingLeft: 0, paddingRight: 0 },
            },
            {
                field: "title",
                headerName: "Titre",
                filter: "agTextColumnFilter",
                minWidth: 500,
            },
            {
                field: "authors",
                headerName: "Auteurs",
                filter: "agTextColumnFilter",
                minWidth: 150,
            },
            {
                field: "genres",
                headerName: "Genres",
                filter: "agTextColumnFilter",
                minWidth: 100,
            },
            {
                field: "publication_year",
                headerName: "Année",
                filter: "agNumberColumnFilter",
                minWidth: 113,
                maxWidth: 113,
            },
            {
                field: "comic",
                headerName: "BD",
                filter: "agTextColumnFilter",
                floatingFilterComponent: MyFloatingFilter,
                minWidth: 91,
                maxWidth: 91,
            },
            {
                field: "read",
                headerName: "Lu",
                filter: "agTextColumnFilter",
                floatingFilterComponent: MyFloatingFilter,
                minWidth: 91,
                maxWidth: 91,
            },
        ],
        [],
    );

    return (
        <div className="ag-theme-alpine">
            <AgGridReact
                domLayout="autoHeight"
                rowData={data}
                columnDefs={columns}
                defaultColDef={{
                    floatingFilter: true,
                    sortable: true,
                    resizable: true,
                    tooltipValueGetter: (params) => params.value,
                }}
                enableCellTextSelection
                tooltipShowDelay={300}
                tooltipInteraction
                onGridReady={(event) => event.api.sizeColumnsToFit()}
            />
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <h1>Mes livres</h1>
            <Tabs className="owned-or-not-tabs">
                <TabList>
                    <Tab>Ma bibliothèque</Tab>
                    <Tab>Ma liste de souhaits</Tab>
                </TabList>
                <TabPanel>
                    <BookTable owned={true} />
                </TabPanel>
                <TabPanel>
                    <BookTable owned={false} />
                </TabPanel>
            </Tabs>
        </div>
    );
}

const container = document.getElementById("root");
if (container == null) {
    alert("wat");
} else {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
}
