import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ComplaintFormProps {
  onSubmit?: (complaint: {
    location: string;
    description: string;
    photo?: File;
  }) => void;
}

const ComplaintForm = ({ onSubmit }: ComplaintFormProps) => {
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      onSubmit?.({
        location,
        description,
        photo: photo || undefined,
      });
      
      toast.success('Complaint submitted successfully!');
      
      // Reset form
      setLocation('');
      setDescription('');
      setPhoto(null);
    } catch (error) {
      toast.error('Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
