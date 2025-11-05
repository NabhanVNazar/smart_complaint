import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Filter } from 'lucide-react';

const FilterBar = ({ onLocationChange, onStatusChange, onDateChange }) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-lg">Filter Complaints</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location-filter">Location</Label>
          <Input
            id="location-filter"
            placeholder="Filter by location..."
            onChange={(e) => onLocationChange?.(e.target.value)}
            className="focus:ring-primary hover:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" className="focus:ring-primary">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date-filter">Date</Label>
          <Input
            id="date-filter"
            type="date"
            onChange={(e) => onDateChange?.(e.target.value)}
            className="focus:ring-primary hover:border-accent transition-colors"
          />
        </div>
      </div>
    </Card>
  );
};

export default FilterBar;
