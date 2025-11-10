import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import ComplaintForm from '@/components/ComplaintForm';
import ComplaintCard from '@/components/ComplaintCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Users, MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useStore } from '@/pages/useStore';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { complaints, fetchUserComplaints, handleStatusUpdateMessage, isAuthenticated } = useStore();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  
  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchComplaints = async () => {
      await fetchUserComplaints();
    };
    fetchComplaints();
  }, [isAuthenticated, navigate, fetchUserComplaints]);

  useEffect(() => {
    const total = complaints.length;
    const pendingCount = complaints.filter(c => c.status.toLowerCase() === 'pending').length;
    const inProgressCount = complaints.filter(c => c.status.toLowerCase() === 'in-progress').length;
    const resolvedCount = complaints.filter(c => c.status.toLowerCase() === 'resolved').length;
    setStats({ total, pending: pendingCount, inProgress: inProgressCount, resolved: resolvedCount });
  }, [complaints]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // WebSocket connection URL needs to be ws:// or wss://
    const wsUrl = apiClient.baseURL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}?token=${token}`);

    ws.onopen = () => {
      console.log('WebSocket connection established.');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'STATUS_UPDATE') {
        handleStatusUpdateMessage(message.payload);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    // Cleanup on component unmount
    return () => ws.close();
  }, [handleStatusUpdateMessage]);



  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': case 'Pending': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <TrendingUp className="h-4 w-4" />;
      case 'resolved': case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'resolved': case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="user" />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Submit and track your complaints with ease</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Complaint Form */}
          <div>
            <ComplaintForm />
          </div>

          {/* Complaints List */}
          <div>
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Your Complaints ({complaints.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaints.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No complaints submitted yet</p>
                      <p className="text-sm">Submit your first complaint using the form</p>
                    </div>
                  ) : (
                    complaints.map((complaint) => (
                      <div key={complaint._id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{complaint.location}</span>
                          </div>
                          <Badge variant="secondary" className={`${getStatusColor(complaint.status)} flex items-center gap-1`}>
                            {getStatusIcon(complaint.status)}
                            {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{complaint.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(complaint.createdAt).toLocaleString()}</span>
                          <span className="font-medium">{complaint.department}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
