import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronRight, X, Filter, FilterX } from 'lucide-react';
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
  const [isMobileFilterCollapsed, setIsMobileFilterCollapsed] = useState(true);
  
  // Separate state for event filter to avoid conflicts with TanStack Table
  const [eventFilter, setEventFilterState] = useState('all');

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
      filterFn: (row, columnId, value) => {
        const cellValue = row.getValue(columnId) as string;
        // Handle potential null/undefined values
        if (!cellValue || !value) return false;
        const result = cellValue.toString().trim() === value.toString().trim();
        // Debug: uncomment the line below to see filtering in action
        // console.log(`Gender filter: "${cellValue}" === "${value}" = ${result}`);
        return result;
      },
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
      filterFn: (row, columnId, value) => {
        const cellValue = row.getValue(columnId) as string;
        // Handle potential null/undefined values
        if (!cellValue || !value) return false;
        const result = cellValue.toString().trim() === value.toString().trim();
        return result;
      },
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
      // Remove the custom filterFn for now - let's use a different approach
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ getValue }: any) => getValue() ?? 'N/A',
      meta: { className: 'hidden sm:table-cell' },
    },
  ], []);

  // Get unique events for filter dropdown (including both primary and extra events)
  const uniqueEvents = useMemo(() => {
    const allEvents = new Set<string>();
    
    archers.forEach(archer => {
      // Add primary event
      if (archer.primaryEvent && archer.primaryEvent.trim() !== '') {
        allEvents.add(archer.primaryEvent);
      }
      
      // Add extra event
      if (archer.extraEvent && archer.extraEvent.trim() !== '') {
        allEvents.add(archer.extraEvent);
      }
    });
    
    return Array.from(allEvents).sort();
  }, [archers]);

  // Get unique clubs for filter dropdown
  const uniqueClubs = useMemo(() => {
    const clubs = [...new Set(archers.map(archer => archer.club))];
    return clubs.filter(club => club && club.trim() !== '').sort();
  }, [archers]);

  // Apply manual filtering for events (since we need to check both primary and extra events)
  const filteredData = useMemo(() => {
    let filtered = [...archers];

    // Apply event filter manually using separate state
    if (eventFilter && eventFilter !== 'all') {
      filtered = filtered.filter(archer => {
        const primaryMatch = archer.primaryEvent === eventFilter;
        const extraMatch = archer.extraEvent && archer.extraEvent.trim() !== '' && archer.extraEvent === eventFilter;
        return primaryMatch || extraMatch;
      });
    }

    return filtered;
  }, [archers, eventFilter]); // Only depend on eventFilter, not columnFilters

  // Configure table
  const table = useReactTable({
    data: filteredData, // Use manually filtered data
    columns,
    state: {
      globalFilter,
      columnFilters, // Keep all column filters as they are
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, columnId, value) => {
      // Custom global filter that includes extraEvent in search
      const searchValue = value.toLowerCase();
      const archer = row.original as Archer;
      
      // Search in name, club, primaryEvent, and extraEvent
      const searchFields = [
        archer.name,
        archer.club,
        archer.primaryEvent,
        archer.extraEvent,
        archer.gender,
        archer.contact
      ];
      
      return searchFields.some(field => 
        field && field.toString().toLowerCase().includes(searchValue)
      );
    },
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
    return eventFilter;
  };

  // Helper function to get club filter value
  const getClubFilter = () => {
    const clubFilter = columnFilters.find(filter => filter.id === 'club');
    return clubFilter?.value as string ?? 'all';
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
    setEventFilterState(value);
  };

  // Update club filter
  const setClubFilter = (value: string) => {
    if (value === 'all') {
      setColumnFilters(prev => prev.filter(filter => filter.id !== 'club'));
    } else {
      setColumnFilters(prev => [
        ...prev.filter(filter => filter.id !== 'club'),
        { id: 'club', value }
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

  // Check if any filters are active
  const hasActiveFilters = () => {
    return getGenderFilter() !== 'all' || 
           getEventFilter() !== 'all' || 
           getClubFilter() !== 'all' || 
           globalFilter.trim() !== '';
  };

  // Debug: Monitor column filters changes (commented out for production)
  // useEffect(() => {
  //   console.log('Column filters changed:', columnFilters);
  //   console.log('Filtered rows count:', table.getFilteredRowModel().rows.length);
  // }, [columnFilters, table]);

  return (
    <div className="participants-container">
      <div className="card">
        {/* Desktop Header */}
        <div className="hide-mobile">
          <div className="space-y-4 mb-6">
            {/* Title and Main Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h3 className="chart-title">
                Participants ({table.getFilteredRowModel().rows.length})
              </h3>
              
              {hasActiveFilters() && (
                <button
                  onClick={() => {
                    setGlobalFilter('');
                    setGenderFilter('all');
                    setEventFilter('all');
                    setClubFilter('all');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                >
                  <FilterX className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
            
            {/* Single Row - All Filters */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Search */}
              <div className="relative min-w-[250px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-tournament-blue focus:ring-0 transition-all duration-200"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Gender Pills */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Gender:</span>
                <button
                  onClick={() => setGenderFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    getGenderFilter() === 'all' 
                      ? 'bg-tournament-blue text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setGenderFilter('Male')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    getGenderFilter() === 'Male' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGenderFilter('Female')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                    getGenderFilter() === 'Female' 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  Female
                </button>
              </div>

              {/* Event Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Event:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={getEventFilter()}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 focus:ring-0 min-w-[150px] ${
                      getEventFilter() !== 'all'
                        ? 'border-purple-400 bg-purple-50 text-purple-800'
                        : 'border-gray-300 bg-white focus:border-purple-400'
                    }`}
                  >
                    <option value="all">All Events</option>
                    {uniqueEvents.map(event => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  {getEventFilter() !== 'all' && (
                    <button
                      onClick={() => setEventFilter('all')}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Clear Event Filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Club Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Club:</span>
                <div className="flex items-center gap-1">
                  <select
                    value={getClubFilter()}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className={`px-3 py-2 text-sm font-medium border rounded-lg transition-all duration-200 focus:ring-0 min-w-[150px] ${
                      getClubFilter() !== 'all'
                        ? 'border-orange-400 bg-orange-50 text-orange-800'
                        : 'border-gray-300 bg-white focus:border-orange-400'
                    }`}
                  >
                    <option value="all">All Clubs</option>
                    {uniqueClubs.map(club => (
                      <option key={club} value={club}>
                        {club.length > 20 ? club.substring(0, 20) + "..." : club}
                      </option>
                    ))}
                  </select>
                  {getClubFilter() !== 'all' && (
                    <button
                      onClick={() => setClubFilter('all')}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Clear Club Filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="ml-auto flex items-center gap-3">
                {hasActiveFilters() && (
                  <span className="text-sm text-blue-600 font-medium bg-blue-100 px-3 py-1 rounded-full">
                    {table.getFilteredRowModel().rows.length} found
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Header */}
        <div className="show-mobile mobile-sticky-header p-4 -mx-4 -mt-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Participants
            </h3>
            <div className="flex items-center gap-3">
              {/* Filter Toggle Button */}
              <button
                onClick={() => setIsMobileFilterCollapsed(!isMobileFilterCollapsed)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  hasActiveFilters()
                    ? 'bg-tournament-blue text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {hasActiveFilters() ? (
                  <FilterX className="w-4 h-4" />
                ) : (
                  <Filter className="w-4 h-4" />
                )}
                {hasActiveFilters() && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
                <span className="hidden sm:inline">
                  {isMobileFilterCollapsed ? 'Show' : 'Hide'} Filters
                </span>
                {isMobileFilterCollapsed ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </button>
              
              {/* Participant Count Badge */}
              <div className="bg-gradient-to-r from-tournament-blue to-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                {table.getFilteredRowModel().rows.length}
              </div>
            </div>
          </div>
          
          
          {/* Mobile Filters - Collapsible Panel */}
          <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileFilterCollapsed 
              ? 'max-h-0 opacity-0' 
              : 'max-h-[800px] opacity-100'
          }`}>
            <div className="pt-4 space-y-4 border-t border-gray-200">
              {/* Search Bar - Enhanced */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, club, or event..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-tournament-blue focus:ring-0 transition-all duration-200 placeholder-gray-500"
                />
                {globalFilter && (
                  <button
                    onClick={() => setGlobalFilter('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Filter Pills */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter by:</p>
                
                {/* Gender Filter Pills */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Gender</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGenderFilter('all')}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        getGenderFilter() === 'all' 
                          ? 'bg-tournament-blue text-white shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setGenderFilter('Male')}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        getGenderFilter() === 'Male' 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      onClick={() => setGenderFilter('Female')}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                        getGenderFilter() === 'Female' 
                          ? 'bg-pink-500 text-white shadow-md' 
                          : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                {/* Event Filter - Expandable */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Event</p>
                    {getEventFilter() !== 'all' && (
                      <button
                        onClick={() => setEventFilter('all')}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={getEventFilter()}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-purple-400 focus:ring-0 transition-all duration-200"
                  >
                    <option value="all">🏹 All Events</option>
                    {uniqueEvents.map(event => (
                      <option key={event} value={event}>
                        🎯 {event}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Club Filter - Expandable */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Club</p>
                    {getClubFilter() !== 'all' && (
                      <button
                        onClick={() => setClubFilter('all')}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={getClubFilter()}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-medium border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-orange-400 focus:ring-0 transition-all duration-200"
                  >
                    <option value="all">🏛️ All Clubs</option>
                    {uniqueClubs.map(club => (
                      <option key={club} value={club}>
                        🏹 {club}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters() && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-800">Active Filters</p>
                    <button
                      onClick={() => {
                        setGlobalFilter('');
                        setGenderFilter('all');
                        setEventFilter('all');
                        setClubFilter('all');
                      }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {globalFilter && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                        Search: "{globalFilter.length > 15 ? globalFilter.substring(0, 15) + "..." : globalFilter}"
                        <button
                          onClick={() => setGlobalFilter('')}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {getGenderFilter() !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        {getGenderFilter()}
                        <button
                          onClick={() => setGenderFilter('all')}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {getEventFilter() !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                        {getEventFilter().length > 12 ? getEventFilter().substring(0, 12) + "..." : getEventFilter()}
                        <button
                          onClick={() => setEventFilter('all')}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                    {getClubFilter() !== 'all' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                        {getClubFilter().length > 12 ? getClubFilter().substring(0, 12) + "..." : getClubFilter()}
                        <button
                          onClick={() => setClubFilter('all')}
                          className="ml-2 text-orange-600 hover:text-orange-800"
                        >
                          ×
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Collapse Button */}
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => setIsMobileFilterCollapsed(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
                >
                  <ChevronUp className="w-4 h-4" />
                  Collapse Filters
                </button>
              </div>
            </div>
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
                          {archer.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                        {/* Full Name - shown when expanded */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-900 font-medium text-left max-w-full">
                            {archer.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                        
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
    </div>
  );
};

export default ParticipantsTable;
