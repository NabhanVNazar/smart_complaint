import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, FileText } from 'lucide-react';

const ComplaintCard = ({
  location,
  description,
  status,
  timestamp,
  department,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-accent text-accent-foreground';
      case 'in-progress':
        return 'bg-primary text-primary-foreground';
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Complaint Details
          </CardTitle>
          <Badge className={getStatusColor(status)}>
            {status.replace('-', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-foreground">{location}</p>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground line-clamp-3">{description}</p>
        </div>

        {department && (
          <div className="text-sm">
            <span className="font-semibold text-foreground">Department: </span>
            <span className="text-primary">{department}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
          <Calendar className="h-3 w-3" />
          <span>{timestamp}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplaintCard;
