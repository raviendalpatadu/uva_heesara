import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronRight } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import type { Archer } from '../types';

interface ParticipantsTableProps {
  archers: Archer[];
}

// Declare module augmentation for meta property
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({ archers }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Define columns
  const columns = useMemo<ColumnDef<Archer>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ getValue }: any) => (
        <div className="font-medium text-gray-900 truncate max-w-xs sm:max-w-none">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'gender',
      header: 'Gender',
      cell: ({ getValue }: any) => (
        <span className={`badge ${
          getValue() === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
        }`}>
          {getValue()}
        </span>
      ),
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'age',
      header: 'Age',
      cell: ({ getValue }: any) => getValue() ?? 'N/A',
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'club',
      header: 'Club',
      cell: ({ getValue }: any) => (
        <div className="truncate max-w-xs sm:max-w-none">
          {getValue()}
        </div>
      ),
    },
    {
      accessorKey: 'primaryEvent',
      header: 'Event',
      cell: ({ row }: any) => (
        <div className="event-chips">
          <span className="event-chip-primary">
            {row.original.primaryEvent}
          </span>
          {row.original.extraEvent && row.original.extraEvent.trim() !== '' && (
            <span className="event-chip-secondary">
              {row.original.extraEvent}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ getValue }: any) => getValue() ?? 'N/A',
      meta: { className: 'hidden sm:table-cell' },
    },
  ], []);

  // Get unique events for filter dropdown
  const uniqueEvents = useMemo(() => {
    const events = [...new Set(archers.map(archer => archer.primaryEvent))];
    return events.filter(event => event && event.trim() !== '');
  }, [archers]);

  // Configure table
  const table = useReactTable({
    data: archers,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  // Helper function to get gender filter value
  const getGenderFilter = () => {
    const genderFilter = columnFilters.find(filter => filter.id === 'gender');
    return genderFilter?.value as string ?? 'all';
  };

  // Helper function to get event filter value
  const getEventFilter = () => {
    const eventFilter = columnFilters.find(filter => filter.id === 'primaryEvent');
    return eventFilter?.value as string ?? 'all';
  };

  // Update gender filter
  const setGenderFilter = (value: string) => {
    if (value === 'all') {
      setColumnFilters(prev => prev.filter(filter => filter.id !== 'gender'));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(filter => filter.id !== 'gender'),
        { id: 'gender', value }
      ]);
    }
  };

  // Update event filter
  const setEventFilter = (value: string) => {
    if (value === 'all') {
      setColumnFilters(prev => prev.filter(filter => filter.id !== 'primaryEvent'));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(filter => filter.id !== 'primaryEvent'),
        { id: 'primaryEvent', value }
      ]);
    }
  };

  // Toggle row expansion for mobile
  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  return (
    <div className="card">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h3 className="chart-title mb-4 sm:mb-0">
            Participants ({table.getFilteredRowModel().rows.length})
          </h3>
        </div>
        
        {/* Filters */}
        <div className="table-filters">
          {/* Search */}
          <div className="search-container">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search participants..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={getGenderFilter()}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          {/* Event Filter */}
          <select
            value={getEventFilter()}
            onChange={(e) => setEventFilter(e.target.value)}
            className="form-select"
          >
            <option value="all">All Events</option>
            {uniqueEvents.map(event => (
              <option key={event} value={event}>{event}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {/* Desktop Table View */}
        <div className="table-container hide-mobile">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className={`table-header text-left cursor-pointer hover:bg-gray-50 ${
                        header.column.columnDef.meta?.className ?? ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getIsSorted() === 'asc' && (
                          <ChevronUp className="w-4 h-4" />
                        )}
                        {header.column.getIsSorted() === 'desc' && (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="table-cell text-center text-gray-500 py-8">
                    {archers.length === 0 ? 'No participants data loaded' : 'No participants match the current filters'}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        className={`table-cell ${cell.column.columnDef.meta?.className ?? ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="show-mobile space-y-3">
          {table.getRowModel().rows.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              {archers.length === 0 ? 'No participants data loaded' : 'No participants match the current filters'}
            </div>
          ) : (
            table.getRowModel().rows.map(row => {
              const archer = row.original;
              const isExpanded = expandedRows.has(row.id);
              
              return (
                <div key={row.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {/* Collapsed Header */}
                  <button
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-tournament-blue focus:ring-inset"
                    onClick={() => toggleRowExpansion(row.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`participant-details-${row.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {archer.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {archer.club}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="event-chip-primary">
                          {archer.primaryEvent}
                        </span>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} />
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div id={`participant-details-${row.id}`} className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Gender:</span>
                          <span className={`badge ${
                            archer.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {archer.gender}
                          </span>
                        </div>
                        
                        {archer.age && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Age:</span>
                            <span className="text-sm text-gray-900">{archer.age} years</span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">Events:</span>
                          <div className="event-chips">
                            <span className="event-chip-primary">
                              {archer.primaryEvent}
                            </span>
                            {archer.extraEvent && archer.extraEvent.trim() !== '' && (
                              <span className="event-chip-secondary">
                                {archer.extraEvent}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {archer.contact && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Contact:</span>
                            <span className="text-sm text-gray-900">{archer.contact}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="pagination-container mt-6">
          <div className="pagination-info">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )} of {table.getFilteredRowModel().rows.length} participants
          </div>
          <div className="pagination-buttons">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="pagination-button border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
              const pageIndex = i + Math.max(0, table.getState().pagination.pageIndex - 2);
              if (pageIndex >= table.getPageCount()) return null;
              return (
                <button
                  key={pageIndex}
                  onClick={() => table.setPageIndex(pageIndex)}
                  className={`pagination-button ${
                    table.getState().pagination.pageIndex === pageIndex
                      ? 'bg-tournament-blue text-white border-tournament-blue'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageIndex + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="pagination-button border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantsTable;
