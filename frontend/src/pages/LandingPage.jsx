import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Brain, Camera, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const LandingPage = () => {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Routing',
      description: 'Machine learning automatically routes complaints to the correct department',
    },
    {
      icon: <Camera className="h-8 w-8" />,
      title: 'Photo Support',
      description: 'Upload images to provide visual evidence of civic issues',
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Real-Time Tracking',
      description: 'Monitor the status of your complaint from submission to resolution',
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: 'Civic-Focused',
      description: 'Built specifically for Indian government departments and citizens',
    },
  ];

  const steps = [
    { number: '01', title: 'Submit Complaint', description: 'Provide location, description, and photo' },
    { number: '02', title: 'AI Processing', description: 'ML model routes to correct department' },
    { number: '03', title: 'Department Review', description: 'Officials review and take action' },
    { number: '04', title: 'Resolution', description: 'Issue resolved and status updated' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-gradient opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Smart Complaint Routing{' '}
                <span className="text-primary">System</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                AI-powered civic tech platform for efficient complaint management and resolution across Indian government departments
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/user-register">
                  <Button size="lg" className="bg-primary hover:bg-accent active:scale-95 transition-all w-full sm:w-auto">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="lg" variant="outline" className="hover:bg-secondary active:scale-95 transition-all w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Smart City Dashboard"
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with modern technology to streamline civic complaint management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-elevated text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 text-primary">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple 4-step process from complaint submission to resolution
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="card-elevated h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="text-5xl font-bold text-primary mb-4">{step.number}</div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of citizens making their communities better through efficient complaint resolution
          </p>
          <Link to="/user-register">
            <Button size="lg" className="bg-primary hover:bg-accent active:scale-95 transition-all">
              Submit Your First Complaint <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              © 2025 Smart Complaint Routing. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                GitHub
              </a>
              <a href="mailto:contact@smartcomplaint.gov.in" className="text-muted-foreground hover:text-accent transition-colors">
                Contact
              </a>
              <Link to="/about" className="text-muted-foreground hover:text-accent transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
