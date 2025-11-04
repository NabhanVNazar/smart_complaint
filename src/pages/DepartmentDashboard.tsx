import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import FilterBar from '@/components/FilterBar';
import ComplaintCard from '@/components/ComplaintCard';
import { Building2 } from 'lucide-react';

const DepartmentDashboard = () => {
  // Mock data - replace with actual API call
  const [complaints] = useState([
    {
      id: '1',
      location: 'MG Road, Bangalore',
      description: 'Large pothole causing traffic issues and accidents',
      status: 'in-progress' as const,
      timestamp: '2025-01-10 14:30',
      department: 'Public Works Department',
    },
    {
      id: '2',
      location: 'Brigade Road, Bangalore',
      description: 'Water pipe leakage near bus stop',
      status: 'pending' as const,
      timestamp: '2025-01-11 10:20',
      department: 'Water Supply Board',
    },
    {
      id: '3',
      location: 'Residency Road, Bangalore',
      description: 'Damaged footpath causing pedestrian safety issues',
      status: 'pending' as const,
      timestamp: '2025-01-11 08:45',
      department: 'Public Works Department',
    },
    {
      id: '4',
      location: 'Commercial Street, Bangalore',
      description: 'Street light not working',
      status: 'resolved' as const,
      timestamp: '2025-01-08 15:30',
      department: 'Electricity Board',
    },
  ]);

  const handleLocationFilter = (location: string) => {
    console.log('Filtering by location:', location);
    // TODO: Implement filtering logic
  };

  const handleStatusFilter = (status: string) => {
    console.log('Filtering by status:', status);
    // TODO: Implement filtering logic
  };

  const handleDateFilter = (date: string) => {
    console.log('Filtering by date:', date);
    // TODO: Implement filtering logic
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader
          title="Department Dashboard"
          subtitle="Review and manage assigned complaints"
          icon={<Building2 className="h-10 w-10" />}
        />

        <FilterBar
          onLocationChange={handleLocationFilter}
          onStatusChange={handleStatusFilter}
          onDateChange={handleDateFilter}
        />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Assigned Complaints ({complaints.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint.id} {...complaint} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
