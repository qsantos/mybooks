import React from 'react';
import ReactDOM from 'react-dom';
import { useFilters, useGlobalFilter, usePagination, useSortBy, useTable } from 'react-table'

import './index.css';
import books from './books.json';

// everything is terrible: https://github.com/TanStack/react-table/issues/3064

function DefaultColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}: any) {
  const count = preFilteredRows.length
  const placeholder = `Filtrer parmi ${count} livres…`;
  return <>
    <input
      value={filterValue || ""}
      onChange={e => setFilter(e.target.value || undefined)}
      placeholder={placeholder}
    />
    {filterValue && <span className="clear-button" onClick={e => setFilter(undefined)}>×</span>}
  </>
}

function BooleanColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
  const ref = React.useRef() as React.MutableRefObject<HTMLInputElement>;;

  React.useEffect(() => {
    if (ref.current == null) {
      return;
    }
    if (filterValue === true) {
      ref.current.checked = true;
      ref.current.indeterminate = false;
    } else if (filterValue === false) {
      ref.current.checked = false;
      ref.current.indeterminate = false;
    } else {
      ref.current.checked = false;
      ref.current.indeterminate = true;
    }
  }, [filterValue]);
  return (
    <input
      type="checkbox"
      value={filterValue}
      onChange={e => setFilter(filterValue === true ? false : filterValue === false ? undefined : true)}
      ref={ref}
    />
  )
}

function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}: any) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0
    preFilteredRows.forEach((row: any) => {
      min = Math.min(row.values[id], min)
      max = Math.max(row.values[id], max)
    })
    return [min, max]
  }, [id, preFilteredRows])

  return (
    <div style={{ display: 'flex' }}>
      <input
        value={filterValue[0] || ''}
        size={3}
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]])
        }}
        placeholder={min.toString()}
        style={{ marginRight: '0.5rem' }}
      />
      à
      <input
        value={filterValue[1] || ''}
        size={3}
        onChange={e => {
          const val = e.target.value
          setFilter((old = []) => [old[0], val ? parseInt(val, 10) : undefined])
        }}
        placeholder={max.toString()}
        style={{ marginLeft: '0.5rem' }}
      />
    </div>
  )
}

const BooleanCell = ({ value }: any) => value ? '✅' : '❌';
const ClickableCell = ({ value, column }: { value: string, column: any }) => {
  return <span className="clickable" onClick={e => column.setFilter(value)}>{value}</span>
}
const ClickableListCell = ({ value, column }: { value: [string], column: any }) => {
  return <span>
    {value
      .map((str, i) => <span key={i} className="clickable" onClick={e => column.setFilter(str)}>{str}</span>)
      .reduce((acc, item) => <>{acc}, {item}</>)
    }
  </span>
}

function BookTable() {
  const columns = React.useMemo(() => [
      { accessor: 'title', Header: 'Titre' },
      { accessor: 'authors', Header: 'Auteurs', Cell: ClickableListCell, disableSortBy: true },
      { accessor: 'genres', Header: 'Genres', Cell: ClickableListCell, disableSortBy: true },
      { accessor: 'publication_year', Header: 'Année', Filter: NumberRangeColumnFilter, filter: 'between' },
      { accessor: 'publication_date', Header: 'Publication' },
      { accessor: 'editor', Header: 'Éditeur', Cell: ClickableCell },
      { accessor: 'pages', Header: 'Pages', Filter: NumberRangeColumnFilter, filter: 'between' },
      { accessor: 'isbn', Header: 'ISBN' },
      { accessor: 'comic', Header: 'BD', Filter: BooleanColumnFilter, filter: "equals", Cell: BooleanCell, disableSortBy: true },
      { accessor: 'read', Header: 'Lu', Filter: BooleanColumnFilter, filter: "equals", Cell: BooleanCell, disableSortBy: true },
      { accessor: 'owned', Header: "J'ai", Filter: BooleanColumnFilter, filter: "equals", Cell: BooleanCell, disableSortBy: true },
  ], [])

  const data = React.useMemo(() => books, [])

  const defaultColumn = React.useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), [])

  const table = useTable(
    // @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/52969
    { columns, data, defaultColumn, initialState: {sortBy: [{id: 'title', desc: false}], pageSize: 25} },
    useFilters, useGlobalFilter, useSortBy, usePagination,
  ) as any
  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      prepareRow,
      visibleColumns,
      canPreviousPage,
      canNextPage,
      pageOptions,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      setPageSize,
      state: { pageIndex, pageSize },
  } = table;

  return (
      <table {...getTableProps()}>
        <thead>
          <tr>
            <th colSpan={visibleColumns.length}>
              <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                  {'⏮'}
                </button>{' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                  {'◄'}
                </button>{' '}
                <span>
                  Page{' '}
                  <input
                    type="number"
                    value={pageIndex + 1}
                    size={3}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      gotoPage(page)
                    }}
                    style={{ maxWidth: '2em' }}
                  />
                  sur {pageOptions.length}
                </span>
                {' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                  {'►'}
                </button>{' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                  {'⏭'}
                </button>
                <br />
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                  }}
                >
                  {[25, 50, 100, 200].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Montrer {pageSize} livres par page
                    </option>
                  ))}
                  <option key={pageSize} value={99999999}>
                    Montrer tous les livres
                  </option>
                </select>
              </div>
            </th>
          </tr>
          {headerGroups.map((headerGroup: any) => (
            <tr className="column-header" {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th {...column.getHeaderProps()}>
                  <span {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {column.isSortedDesc ? ' 🔽' : column.isSorted ? ' 🔼' : ''}
                  </span>
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row: any) => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell: any) => {
                  return (
                    <td
                      {...cell.getCellProps()}
                    >
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
  )
}

function App() {
  return (
    <div className="App">
      <h1>La bibliothèque de Clémentine</h1>
      <BookTable />
    </div>
  )
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
