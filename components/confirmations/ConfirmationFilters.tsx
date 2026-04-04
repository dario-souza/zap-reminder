import { Search, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DATE_FILTER_LABELS, type DateFilter } from '@/lib/dateFilter'

interface ConfirmationFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFilter: DateFilter
  onDateFilterChange: (value: DateFilter) => void
  onNewClick: () => void
}

export function ConfirmationFilters({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  onNewClick,
}: ConfirmationFiltersProps) {
  const filters: DateFilter[] = ['all', 'today', 'tomorrow', 'thisWeek', 'nextWeek', 'later', 'past']

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Buscar confirmações..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button className="bg-green-500 hover:bg-green-600" onClick={onNewClick}>
          <Calendar className="w-5 h-5 mr-2" />
          Nova Confirmação
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={dateFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => onDateFilterChange(filter)}
            className={dateFilter === filter ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {DATE_FILTER_LABELS[filter]}
          </Button>
        ))}
      </div>
    </>
  )
}
