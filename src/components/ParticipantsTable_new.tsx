import React, { useState, useMemo, useEffect } from 'react';
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
  }, [archers, eventFilter]);

  // Configure table
  const table = useReactTable({
    data: filteredData,
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

  return (
    <div className="participants-container">
      <div className="card">
        {/* Desktop Header */}
        <div className="hide-mobile">
          <div className="space-y-8 mb-8">
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
                  className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 border-2 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md"
                >
                  <FilterX className="w-5 h-5" />
                  Clear All Filters
                </button>
              )}
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, club, or event..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-tournament-blue focus:ring-0 transition-all duration-200 placeholder-gray-500 shadow-sm focus:shadow-md"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Pills and Dropdowns */}
            <div className="space-y-6">
              {/* Gender Filter Pills */}
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Gender</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setGenderFilter('all')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md ${
                      getGenderFilter() === 'all' 
                        ? 'bg-tournament-blue text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Genders
                  </button>
                  <button
                    onClick={() => setGenderFilter('Male')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md ${
                      getGenderFilter() === 'Male' 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => setGenderFilter('Female')}
                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm hover:shadow-md ${
                      getGenderFilter() === 'Female' 
                        ? 'bg-pink-500 text-white shadow-md' 
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Event and Club Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Event</p>
                    {getEventFilter() !== 'all' && (
                      <button
                        onClick={() => setEventFilter('all')}
                        className="text-sm text-red-500 hover:text-red-700 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={getEventFilter()}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className={`w-full px-4 py-4 text-sm font-bold border-2 rounded-xl transition-all duration-200 focus:ring-0 shadow-sm focus:shadow-md ${
                      getEventFilter() !== 'all'
                        ? 'border-purple-400 bg-purple-50 text-purple-800'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-400'
                    }`}
                  >
                    <option value="all">🏹 All Events</option>
                    {uniqueEvents.map(event => (
                      <option key={event} value={event}>
                        🎯 {event}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Club Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Club</p>
                    {getClubFilter() !== 'all' && (
                      <button
                        onClick={() => setClubFilter('all')}
                        className="text-sm text-red-500 hover:text-red-700 font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <select
                    value={getClubFilter()}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className={`w-full px-4 py-4 text-sm font-bold border-2 rounded-xl transition-all duration-200 focus:ring-0 shadow-sm focus:shadow-md ${
                      getClubFilter() !== 'all'
                        ? 'border-orange-400 bg-orange-50 text-orange-800'
                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-400'
                    }`}
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
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-bold text-blue-800 uppercase tracking-wide">Active Filters</p>
                  <span className="text-sm text-blue-600 font-bold bg-blue-100 px-3 py-1 rounded-full">
                    {table.getFilteredRowModel().rows.length} participants found
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {globalFilter && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-blue-100 text-blue-800 font-bold border border-blue-200 shadow-sm">
                      Search: "{globalFilter.length > 20 ? globalFilter.substring(0, 20) + "..." : globalFilter}"
                      <button
                        onClick={() => setGlobalFilter('')}
                        className="ml-2 text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {getGenderFilter() !== 'all' && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-green-100 text-green-800 font-bold border border-green-200 shadow-sm">
                      Gender: {getGenderFilter()}
                      <button
                        onClick={() => setGenderFilter('all')}
                        className="ml-2 text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {getEventFilter() !== 'all' && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-purple-100 text-purple-800 font-bold border border-purple-200 shadow-sm">
                      Event: {getEventFilter().length > 15 ? getEventFilter().substring(0, 15) + "..." : getEventFilter()}
                      <button
                        onClick={() => setEventFilter('all')}
                        className="ml-2 text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {getClubFilter() !== 'all' && (
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm bg-orange-100 text-orange-800 font-bold border border-orange-200 shadow-sm">
                      Club: {getClubFilter().length > 15 ? getClubFilter().substring(0, 15) + "..." : getClubFilter()}
                      <button
                        onClick={() => setClubFilter('all')}
                        className="ml-2 text-orange-600 hover:text-orange-800 p-1 rounded-full hover:bg-orange-200 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Sticky Header */}
        <div className="show-mobile mobile-sticky-header p-4 -mx-4 -mt-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              Participants ({table.getFilteredRowModel().rows.length})
            </h3>
            <button
              onClick={() => setIsMobileFilterCollapsed(!isMobileFilterCollapsed)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-tournament-blue bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {isMobileFilterCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Active filters summary for mobile */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 mb-3">
              {globalFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                  "{globalFilter.length > 10 ? globalFilter.substring(0, 10) + "..." : globalFilter}"
                  <button onClick={() => setGlobalFilter('')} className="ml-1 text-blue-600">×</button>
                </span>
              )}
              {getGenderFilter() !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                  {getGenderFilter()}
                  <button onClick={() => setGenderFilter('all')} className="ml-1 text-green-600">×</button>
                </span>
              )}
              {getEventFilter() !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 font-medium">
                  {getEventFilter().length > 8 ? getEventFilter().substring(0, 8) + "..." : getEventFilter()}
                  <button onClick={() => setEventFilter('all')} className="ml-1 text-purple-600">×</button>
                </span>
              )}
              {getClubFilter() !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 font-medium">
                  {getClubFilter().length > 8 ? getClubFilter().substring(0, 8) + "..." : getClubFilter()}
                  <button onClick={() => setClubFilter('all')} className="ml-1 text-orange-600">×</button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filter Panel */}
        <div className={`show-mobile mobile-filter-panel ${isMobileFilterCollapsed ? 'collapsed' : 'expanded'}`}>
          <div className="space-y-6 p-4 bg-gray-50 rounded-xl mx-4 mb-4">
            {/* Enhanced Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, club, or event..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full pl-12 pr-10 py-4 text-base border-2 border-gray-200 rounded-xl bg-white focus:border-tournament-blue focus:ring-0 transition-all duration-200 placeholder-gray-500 shadow-sm"
              />
              {globalFilter && (
                <button
                  onClick={() => setGlobalFilter('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Gender Filter Pills */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Gender</p>
                {getGenderFilter() !== 'all' && (
                  <button
                    onClick={() => setGenderFilter('all')}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
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

            {/* Event Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Event</p>
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
                className={`w-full px-4 py-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 focus:ring-0 ${
                  getEventFilter() !== 'all'
                    ? 'border-purple-400 bg-purple-50 text-purple-800'
                    : 'border-gray-200 bg-white focus:border-purple-400'
                }`}
              >
                <option value="all">🏹 All Events</option>
                {uniqueEvents.map(event => (
                  <option key={event} value={event}>
                    🎯 {event}
                  </option>
                ))}
              </select>
            </div>

            {/* Club Filter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Club</p>
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
                className={`w-full px-4 py-3 text-sm font-medium border-2 rounded-xl transition-all duration-200 focus:ring-0 ${
                  getClubFilter() !== 'all'
                    ? 'border-orange-400 bg-orange-50 text-orange-800'
                    : 'border-gray-200 bg-white focus:border-orange-400'
                }`}
              >
                <option value="all">🏛️ All Clubs</option>
                {uniqueClubs.map(club => (
                  <option key={club} value={club}>
                    🏹 {club.length > 25 ? club.substring(0, 25) + "..." : club}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear All Button */}
            {hasActiveFilters() && (
              <button
                onClick={() => {
                  setGlobalFilter('');
                  setGenderFilter('all');
                  setEventFilter('all');
                  setClubFilter('all');
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200"
              >
                <FilterX className="w-4 h-4" />
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="table-wrapper">
          {/* Desktop Table */}
          <div className="table-container hide-mobile">
            <table className="participants-table">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        className={header.column.columnDef.meta?.className}
                        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                        style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                      >
                        <div className="flex items-center gap-2">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <div className="sort-indicator">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Table */}
          <div className="show-mobile space-y-3">
            {table.getRowModel().rows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg font-medium">No participants found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              table.getRowModel().rows.map(row => {
                const archer = row.original as Archer;
                const isExpanded = expandedRows.has(row.id);
                
                return (
                  <div key={row.id} className="mobile-participant-card">
                    <div 
                      className="mobile-participant-header"
                      onClick={() => toggleRowExpansion(row.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 truncate">{archer.name}</h4>
                          <span className={`badge ml-2 ${
                            archer.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {archer.gender}
                          </span>
                        </div>
                        <div className="mt-1 space-y-1">
                          <p className="text-sm text-gray-600 truncate">{archer.club}</p>
                          <div className="flex items-center gap-2">
                            <span className="event-chip-primary text-xs">{archer.primaryEvent}</span>
                            {archer.extraEvent && archer.extraEvent.trim() !== '' && (
                              <span className="event-chip-secondary text-xs">{archer.extraEvent}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {isExpanded && (
                      <div className="mobile-participant-details">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">Age</p>
                            <p className="text-gray-900">{archer.age ?? 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">Contact</p>
                            <p className="text-gray-900 break-words">{archer.contact ?? 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsTable;
