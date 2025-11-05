import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

const DepartmentRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    departmentName: '',
    departmentType: '',
    email: '',
    phone: '',
    officerName: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await apiClient.registerDepartment(formData);
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        toast.success('Department registered successfully!');
        navigate('/department-dashboard');
      } else {
        toast.success('Department registered successfully! Please login.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Department Registration</CardTitle>
          <CardDescription>Register your government department</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departmentName">Department Name *</Label>
              <Input
                id="departmentName"
                name="departmentName"
                placeholder="e.g., Public Works Department"
                value={formData.departmentName}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="departmentType">Department Type *</Label>
              <Select
                onValueChange={(value) => setFormData({ ...formData, departmentType: value })}
                required
              >
                <SelectTrigger className="focus:ring-primary">
                  <SelectValue placeholder="Select department type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public-works">Public Works</SelectItem>
                  <SelectItem value="water-supply">Water Supply</SelectItem>
                  <SelectItem value="electricity">Electricity Board</SelectItem>
                  <SelectItem value="waste-management">Waste Management</SelectItem>
                  <SelectItem value="traffic-police">Traffic Police</SelectItem>
                  <SelectItem value="health">Health Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="officerName">Officer Name *</Label>
              <Input
                id="officerName"
                name="officerName"
                placeholder="Name of authorized officer"
                value={formData.officerName}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Official Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="department@gov.in"
                value={formData.email}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact Number *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a secure password"
                value={formData.password}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="focus:ring-primary hover:border-accent transition-colors"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-accent active:scale-95 transition-all">
              Register Department
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="text-primary hover:text-accent hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentRegister;
