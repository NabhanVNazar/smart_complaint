import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Users, Zap } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            About Smart Complaint Routing
          </h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Revolutionizing civic complaint management in India through AI-powered technology
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="mx-auto mb-4 text-primary">
                  <Target className="h-12 w-12" />
                </div>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To streamline civic issue resolution and improve government-citizen communication
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="mx-auto mb-4 text-primary">
                  <Zap className="h-12 w-12" />
                </div>
                <CardTitle>Technology</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Machine learning models automatically route complaints to correct departments
                </p>
              </CardContent>
            </Card>

            <Card className="card-elevated text-center">
              <CardHeader>
                <div className="mx-auto mb-4 text-primary">
                  <Users className="h-12 w-12" />
                </div>
                <CardTitle>Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Serving thousands of citizens and multiple government departments across India
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">The Problem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Citizens often struggle to identify the correct government department to address their civic complaints. 
                This leads to delays, multiple submissions, and frustration on both sides.
              </p>
              <p>
                Traditional complaint management systems lack intelligent routing, resulting in misrouted complaints, 
                overburdened departments, and poor resolution rates.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">Our Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Smart Complaint Routing System uses machine learning to automatically analyze complaint descriptions 
                and route them to the appropriate government department. This ensures:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Faster resolution times</li>
                <li>Reduced burden on citizens to identify departments</li>
                <li>Better resource allocation for government departments</li>
                <li>Transparent tracking of complaint status</li>
                <li>Data-driven insights for civic improvement</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p><strong>Frontend:</strong> React, TypeScript, Tailwind CSS</p>
              <p><strong>ML Model:</strong> Natural Language Processing for complaint classification</p>
              <p><strong>Features:</strong> Photo upload, real-time tracking, department dashboards</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
