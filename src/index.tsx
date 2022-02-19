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
    {filterValue && <span className="clearButton" onClick={e => setFilter(undefined)}>×</span>}
  </>
}

function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}: any) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set()
    preFilteredRows.forEach((row: any) => {
      options.add(row.values[id])
    })
    // @ts-ignore
    return [...options.values()]
  }, [id, preFilteredRows])

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={e => setFilter(e.target.value || undefined)}
    >
      <option value="">Tous</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option === true ? 'Oui' : option === false ? 'Non' : option}
        </option>
      ))}
    </select>
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
    <div
      style={{
        display: 'flex',
      }}
    >
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

const BooleanCell = ({ value }: any) => value ? 'Oui' : 'Non';
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
      { accessor: 'authors', Header: 'Auteurs', Cell: ClickableListCell },
      { accessor: 'genres', Header: 'Genres', Cell: ClickableListCell },
      { accessor: 'publication_year', Header: 'Année', Filter: NumberRangeColumnFilter, filter: 'between' },
      { accessor: 'publication_date', Header: 'Date de publication' },
      { accessor: 'editor', Header: 'Éditeur', Cell: ClickableCell },
      { accessor: 'pages', Header: 'Pages', Filter: NumberRangeColumnFilter, filter: 'between' },
      { accessor: 'isbn', Header: 'ISBN' },
      { accessor: 'read', Header: 'Lu', Filter: SelectColumnFilter, Cell: BooleanCell },
  ], [])

  const data = React.useMemo(() => books, [])

  const defaultColumn = React.useMemo(() => ({
    Filter: DefaultColumnFilter,
  }), [])

  // @ts-ignore: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/52969
  const table = useTable({ columns, data, defaultColumn }, useFilters, useGlobalFilter, useSortBy, usePagination) as any
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
      <table {...getTableProps()} style={{ borderCollapse: 'collapse' }}>
        <thead>
          {headerGroups.map((headerGroup: any) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any) => (
                <th
                  {...column.getHeaderProps()}
                  style={{
                    borderBottom: 'solid 1px black',
                    background: 'aliceblue',
                    fontWeight: 'bold',
                  }}
                >
                  {column.render('Header')}
                  <div>{column.canFilter ? column.render('Filter') : null}</div>
                  <span {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {
                      column.isSortedDesc ? '🔽' :
                      column.isSorted ? '🔼' :
                      column.canSort ? '🔀' :
                      ''
                    }
                  </span>
                </th>
              ))}
            </tr>
          ))}
          <tr>
            <th colSpan={visibleColumns.length}>
              <div className="pagination">
                <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                  {'<<'}
                </button>{' '}
                <button onClick={() => previousPage()} disabled={!canPreviousPage}>
                  {'<'}
                </button>{' '}
                <button onClick={() => nextPage()} disabled={!canNextPage}>
                  {'>'}
                </button>{' '}
                <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                  {'>>'}
                </button>{' '}
                <span>
                  Page{' '}
                  <strong>
                    {pageIndex + 1} sur {pageOptions.length}
                  </strong>{' '}
                </span>
                <span>
                  | Aller à la page : {' '}
                  <input
                    type="number"
                    defaultValue={pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      gotoPage(page)
                    }}
                    style={{ width: '100px' }}
                  />
                </span>{' '}
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                  }}
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Montrer {pageSize}
                    </option>
                  ))}
                  <option key={pageSize} value={99999999}>
                    Montrer tous
                  </option>
                </select>
              </div>
            </th>
            </tr>
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
                      style={{
                        padding: '10px',
                        borderTop: 'solid 1px gray',
                      }}
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
      <h1>📖 La bibliothèque de Clémentine 📖</h1>
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
