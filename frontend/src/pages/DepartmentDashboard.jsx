import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '@/components/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Users, MapPin, Filter, Calendar, Search, RefreshCw, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '@/pages/useStore';

const DepartmentDashboard = () => {
  const navigate = useNavigate();
  const {
    complaints, pagination, fetchDepartmentComplaints, updateComplaintStatus, setPage, isAuthenticated
  } = useStore();
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0
  });
  const [filters, setFilters] = useState({
    location: '',
    status: 'all',
    date: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchDepartmentComplaints(pagination.page);
  }, [isAuthenticated, navigate, fetchDepartmentComplaints, pagination.page]);

  useEffect(() => {
    // This logic is for client-side filtering. It runs whenever the base complaints list or filters change.
    const total = pagination.totalComplaints;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    setStats({ total, pending, resolved });
  }, [complaints, pagination.totalComplaints]);

  useEffect(() => {
    let filtered = [...complaints];

    // Location filter
    if (filters.location.trim()) {
      filtered = filtered.filter(complaint =>
        complaint.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(complaint => complaint.status === filters.status);
    }

    // Date filter
    if (filters.date) {
      filtered = filtered.filter(complaint => complaint.createdAt.startsWith(filters.date));
    }

    setFilteredComplaints(filtered);
  }, [complaints, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="h-4 w-4" />;
      case 'Resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      S: 'bg-red-500 text-white',
      A: 'bg-orange-500 text-white',
      B: 'bg-yellow-500 text-black',
      C: 'bg-blue-500 text-white',
    };
    return <Badge className={`${styles[severity] || 'bg-gray-400'} w-8 h-8 flex items-center justify-center text-sm font-bold`}>{severity}</Badge>;
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      status: 'all',
      date: ''
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="department" />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Department Dashboard</h1>
          <p className="text-muted-foreground">Manage and resolve citizen complaints efficiently</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-elevated">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Complaints</p>
                  <p className="text-3xl font-bold text-foreground">{pagination.totalComplaints}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Filters */}
        <Card className="card-elevated mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={filters.date}
                    onChange={(e) => handleFilterChange('date', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <Users className="h-5 w-5 text-primary" />
              Complaints ({pagination.totalComplaints})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredComplaints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No complaints found</p>
                  <p className="text-sm">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                filteredComplaints.map((complaint) => (
                  <div key={complaint._id} className="border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getSeverityBadge(complaint.severity)}
                        <div>
                          <h3 className="font-semibold text-foreground">{complaint.location}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${getStatusColor(complaint.status)} flex items-center gap-1`}>
                          {getStatusIcon(complaint.status)}
                          {complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1)}
                        </Badge>
                        <Select
                          value={complaint.status}
                          onValueChange={(value) => updateComplaintStatus(complaint._id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{complaint.description}</p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-primary">{complaint.department}</span>
                      <span className="text-muted-foreground">ID: {complaint._id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                ><ChevronLeft className="h-4 w-4" /> Previous</Button>
                <span className="mx-4 text-sm font-medium">Page {pagination.page} of {pagination.totalPages}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DepartmentDashboard;
