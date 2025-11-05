import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import FilterBar from '@/components/FilterBar';
import ComplaintCard from '@/components/ComplaintCard';
import { Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

const DepartmentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await apiClient.getComplaints();
        setComplaints(data);
        setFilteredComplaints(data);
      } catch (error) {
        console.error('Failed to load complaints');
      }
    };
    fetchComplaints();
  }, []);

  const handleLocationFilter = (location) => {
    if (!location.trim()) {
      setFilteredComplaints(complaints);
      return;
    }
    const filtered = complaints.filter(complaint =>
      complaint.location.toLowerCase().includes(location.toLowerCase())
    );
    setFilteredComplaints(filtered);
  };

  const handleStatusFilter = (status) => {
    if (status === 'all') {
      setFilteredComplaints(complaints);
      return;
    }
    const filtered = complaints.filter(complaint => complaint.status === status);
    setFilteredComplaints(filtered);
  };

  const handleDateFilter = (date) => {
    if (!date) {
      setFilteredComplaints(complaints);
      return;
    }
    const filtered = complaints.filter(complaint =>
      complaint.timestamp.startsWith(date)
    );
    setFilteredComplaints(filtered);
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
            Assigned Complaints ({filteredComplaints.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {filteredComplaints.map((complaint) => (
              <ComplaintCard key={complaint.id} {...complaint} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
