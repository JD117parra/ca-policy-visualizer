import { forwardRef } from 'react'
import type { ConditionalAccessPolicyState } from '@/types/policy'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const STATE_OPTIONS: { value: ConditionalAccessPolicyState | 'all'; label: string; variant: 'success' | 'destructive' | 'warning' | 'secondary' }[] = [
  { value: 'all', label: 'All', variant: 'secondary' },
  { value: 'enabled', label: 'Enabled', variant: 'success' },
  { value: 'disabled', label: 'Disabled', variant: 'destructive' },
  { value: 'enabledForReportingButNotEnforced', label: 'Report-only', variant: 'warning' },
]

interface PolicyFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  stateFilter: ConditionalAccessPolicyState | 'all'
  onStateFilterChange: (state: ConditionalAccessPolicyState | 'all') => void
  totalCount: number
  filteredCount: number
}

export const PolicyFilters = forwardRef<HTMLInputElement, PolicyFiltersProps>(
  function PolicyFilters(
    { searchQuery, onSearchChange, stateFilter, onStateFilterChange, totalCount, filteredCount },
    ref,
  ) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 border-b border-border bg-muted/30">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={ref}
            type="text"
            placeholder="Search policies... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* State filter */}
        <div className="flex items-center gap-1.5">
          {STATE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onStateFilterChange(option.value)}
            >
              <Badge
                variant={stateFilter === option.value ? option.variant : 'outline'}
                className={cn(
                  'cursor-pointer transition-opacity',
                  stateFilter !== option.value && 'opacity-50 hover:opacity-80',
                )}
              >
                {option.label}
              </Badge>
            </button>
          ))}
        </div>

        {/* Count */}
        {filteredCount !== totalCount && (
          <span className="text-xs text-muted-foreground">
            {filteredCount} of {totalCount}
          </span>
        )}
      </div>
    )
  },
)
