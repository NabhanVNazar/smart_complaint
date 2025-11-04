import { useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintCard from '@/components/ComplaintCard';
import { ClipboardList } from 'lucide-react';

const UserDashboard = () => {
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
      location: 'Indiranagar, Bangalore',
      description: 'Street lights not working for the past week',
      status: 'pending' as const,
      timestamp: '2025-01-09 09:15',
      department: 'Electricity Board',
    },
    {
      id: '3',
      location: 'Koramangala, Bangalore',
      description: 'Garbage not collected for 3 days',
      status: 'resolved' as const,
      timestamp: '2025-01-05 16:45',
      department: 'Waste Management',
    },
  ]);

  const handleSubmit = (complaint: any) => {
    console.log('Submitting complaint:', complaint);
    // TODO: Integrate with backend API
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader
          title="User Dashboard"
          subtitle="Submit and track your complaints"
          icon={<ClipboardList className="h-10 w-10" />}
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Complaint Form */}
          <div>
            <ComplaintForm onSubmit={handleSubmit} />
          </div>

          {/* Complaints List */}
          <div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Your Complaints</h2>
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <ComplaintCard key={complaint.id} {...complaint} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
