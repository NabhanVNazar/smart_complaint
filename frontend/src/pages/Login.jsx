import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/pages/useStore';

const Login = () => {
  const navigate = useNavigate();
  const { login, generateDeptLoginOtp: generateOtp } = useStore();
  const [userLogin, setUserLogin] = useState({ email: '', password: '' });
  const [deptLogin, setDeptLogin] = useState({ email: '', otp: '' });
  const [deptStep, setDeptStep] = useState(1); // 1: enter email, 2: enter OTP
  const [isLoading, setIsLoading] = useState(false);

  const handleUserLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(userLogin, 'user');
      toast.success('Login successful!');
      navigate('/user-dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleDeptLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (deptStep === 1) {
      try {
        const success = await generateOtp({ email: deptLogin.email });
        if (success) setDeptStep(2);
      } catch (error) {
        toast.error(error.message || 'Failed to generate OTP');
      }
    } else {
      try {
        const response = await login(deptLogin, 'department');
        if (response.token) {
          toast.success('Login successful!');
          navigate('/department-dashboard');
        }
      } catch (error) {
        toast.error(error.message || 'Login failed');
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="department">Department Login</TabsTrigger>
            </TabsList>

            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-email">Email Address</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={userLogin.email}
                    onChange={(e) => setUserLogin({ ...userLogin, email: e.target.value })}
                    required
                    className="focus:ring-primary hover:border-accent transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-password">Password</Label>
                  <Input
                    id="user-password"
                    type="password"
                    placeholder="Enter your password"
                    value={userLogin.password}
                    onChange={(e) => setUserLogin({ ...userLogin, password: e.target.value })}
                    required
                    className="focus:ring-primary hover:border-accent transition-colors"
                  />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-accent active:scale-95 transition-all">
                  Login as User
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/user-register" className="text-primary hover:text-accent hover:underline">
                    Register here
                  </Link>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="department">
              <form onSubmit={handleDeptLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-email">Official Email</Label>
                  <Input
                    id="dept-email"
                    type="email"
                    placeholder="department@gov.in"
                    value={deptLogin.email}
                    onChange={(e) => setDeptLogin({ ...deptLogin, email: e.target.value })}
                    required
                    className="focus:ring-primary hover:border-accent transition-colors"
                    disabled={deptStep === 2}
                  />
                </div>

                {deptStep === 2 && (
                  <div className="space-y-2">
                    <Label htmlFor="dept-otp">OTP</Label>
                    <Input
                      id="dept-otp"
                      type="text"
                      placeholder="Enter OTP from console"
                      value={deptLogin.otp}
                      onChange={(e) => setDeptLogin({ ...deptLogin, otp: e.target.value })}
                      required
                      className="focus:ring-primary hover:border-accent transition-colors"
                    />
                  </div>
                )}

                <Button type="submit" className="w-full bg-primary hover:bg-accent active:scale-95 transition-all">
                  Login as Department
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  New department?{' '}
                  <Link to="/department-register" className="text-primary hover:text-accent hover:underline">
                    Register here
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
