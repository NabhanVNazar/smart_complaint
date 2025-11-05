import { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintCard from '@/components/ComplaintCard';
import { ClipboardList } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

const UserDashboard = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const data = await apiClient.getComplaints();
        setComplaints(data);
      } catch (error) {
        toast.error('Failed to load complaints');
      }
    };
    fetchComplaints();
  }, []);

  const handleSubmit = async (complaint) => {
    try {
      await apiClient.createComplaint(complaint);
      toast.success('Complaint submitted successfully!');
      // Refresh complaints list
      const data = await apiClient.getComplaints();
      setComplaints(data);
    } catch (error) {
      toast.error(error.message || 'Failed to submit complaint');
    }
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
