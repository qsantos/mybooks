import React from 'react';
import { forwardRef, useEffect, useImperativeHandle , useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ColDef, FilterChangedEvent, IFloatingFilterParams, IFloatingFilterParent } from '@ag-grid-community/core';
import { AgGridReact, IFloatingFilterReactComp } from '@ag-grid-community/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-alpine.css";

import './index.css';
import books from './books.json';

ModuleRegistry.registerModules([ ClientSideRowModelModule ]);

const MyFloatingFilter = forwardRef((props: IFloatingFilterParams, ref) => {
    const [currentValue, setCurrentValue] = useState<boolean | undefined>(undefined);
    const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;

    function onChange() {
        let newValue = currentValue === true ? false : currentValue === false ? undefined : true;
        setCurrentValue(newValue);
        props.parentFilterInstance((instance: IFloatingFilterParent) => {
            if (newValue === undefined) {
                instance.onFloatingFilterChanged(null, null);
            } else {
                instance.onFloatingFilterChanged(newValue ? 'true' : 'false', null);
            }
        });
    }

    useImperativeHandle(ref, (): IFloatingFilterReactComp => {
        return {
            onParentModelChanged(parentModel: FilterChangedEvent) {
                if (parentModel) {
                    setCurrentValue(parentModel.type === 'true');
                } else {
                    setCurrentValue(undefined);
                }
            }
        }
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
    }, [currentValue]);

    return (
        <>
            <input ref={inputRef} type="checkbox" value={"on"} onChange={onChange} />
        </>
    );
});

function BookTable({ owned }: { owned: boolean }) {
  const data = React.useMemo(() => books.filter(book => book.owned === owned), []);

  const columns: ColDef<typeof books[0]>[] = React.useMemo(() => [
      { field: 'title', headerName: 'Titre', filter: 'agTextColumnFilter', width: 300 },
      { field: 'authors', headerName: 'Auteurs', filter: 'agTextColumnFilter' },
      { field: 'genres', headerName: 'Genres', filter: 'agTextColumnFilter' },
      { field: 'publication_year', headerName: 'Année', filter: 'agNumberColumnFilter', width: 100 },
      { field: 'publication_date', headerName: 'Publication', filter: 'agDateColumnFilter' },
      { field: 'editor', headerName: 'Éditeur', filter: 'agTextColumnFilter' },
      { field: 'pages', headerName: 'Pages', filter: 'agNumberColumnFilter', width: 100 },
      { field: 'isbn', headerName: 'ISBN', filter: 'agTextColumnFilter', width: 150 },
      { field: 'comic', headerName: 'BD', filter: 'agTextColumnFilter', floatingFilterComponent: MyFloatingFilter, width: 100 },
      { field: 'read', headerName: 'Lu', filter: 'agTextColumnFilter', floatingFilterComponent: MyFloatingFilter, width: 100 },
  ], [])

  return (
    <div className="ag-theme-alpine">
        <AgGridReact
            domLayout='autoHeight'
            rowData={data}
            columnDefs={columns}
            defaultColDef={{ floatingFilter: true, sortable: true, resizable: true, tooltipValueGetter: (params) => params.value }}
            enableCellTextSelection
            tooltipShowDelay={300}
            tooltipInteraction
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
  )
}

const container = document.getElementById('root')
if (container == null) {
  alert('wat');
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
