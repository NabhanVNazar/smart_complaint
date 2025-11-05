import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

const ComplaintForm = ({ onSubmit }) => {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location.trim() || !description.trim() || !department) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const complaintData = {
        title: `Complaint from ${location}`,
        description,
        location,
        department,
        status: 'pending'
      };

      await apiClient.createComplaint(complaintData);

      toast.success('Complaint submitted successfully!');

      // Reset form
      setLocation('');
      setDescription('');
      setDepartment('');
      setPhoto(null);
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Submit a Complaint
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Location *
            </Label>
            <Input
              id="location"
              placeholder="Enter the location of the issue"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="focus:ring-primary hover:border-accent transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="focus:ring-primary hover:border-accent transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Select value={department} onValueChange={setDepartment} required>
              <SelectTrigger className="focus:ring-primary">
                <SelectValue placeholder="Select relevant department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public Works">Public Works</SelectItem>
                <SelectItem value="Water Supply">Water Supply</SelectItem>
                <SelectItem value="Electricity">Electricity Board</SelectItem>
                <SelectItem value="Waste Management">Waste Management</SelectItem>
                <SelectItem value="Traffic Police">Traffic Police</SelectItem>
                <SelectItem value="Health">Health Department</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-accent" />
              Upload Photo (Optional)
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="cursor-pointer"
            />
            {photo && (
              <p className="text-sm text-muted-foreground">
                Selected: {photo.name}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-accent active:scale-95 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ComplaintForm;
