import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '@/pages/useStore';

const DepartmentRegister = () => {
  const navigate = useNavigate();
  // Get authorities and fetchAuthorities from the store
  const { states, districts, authorities, fetchStates, fetchDistricts, fetchAuthorities, generateDepartmentOtp, verifyDepartmentOtp, isLoading } = useStore();
  const [step, setStep] = useState(1); // 1: Level, 2: Location, 3: Department, 4: Details, 5: OTP
  const [formData, setFormData] = useState({
    level: '',
    state: '',
    district: '',
    authorityId: '',
    email: '',
    phone: '',
    otp: '',
  });

  useEffect(() => {
    if (step === 2 && (formData.level === 'state' || formData.level === 'district')) {
      fetchStates();
    }
    if (step === 2 && formData.level === 'district' && formData.state) {
      // For central, we don't need to fetch districts, it's implicitly Delhi
      if (formData.level !== 'central') {
        fetchDistricts(formData.state);
      }
    } else if (step === 2 && formData.level === 'central') {
      // Auto-select Delhi for central and move to department selection
      setFormData(prev => ({ ...prev, state: 'Delhi', district: 'New Delhi' }));
      setStep(3);
    }
    if (step === 3) {
      fetchAuthorities({ level: formData.level, state: formData.state, district: formData.district });
    }
  }, [step, formData.level, formData.state, fetchStates, fetchDistricts, fetchAuthorities]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step < 3) { // Move to next selection step
      if (formData.level === 'central' && step === 1) setStep(2); // Go to location step to auto-select Delhi
      else setStep(step + 1);
      return;
    }
    if (step === 3) { // Move to details entry
      setStep(4);
      return;
    }
    if (step === 4) { // Generate OTP
      if (!/^\+91[6-9]\d{9}$/.test(formData.phone)) {
        toast.error('Please enter a valid Indian phone number (e.g., +919876543210)');
        return;
      }
      const success = await generateDepartmentOtp({ authorityId: formData.authorityId, phone: formData.phone });
      if (success) {
        setStep(5); // Move to OTP verification step
      }
    } else { // Verify OTP
      const success = await verifyDepartmentOtp({ authorityId: formData.authorityId, phone: formData.phone, otp: formData.otp });
      if (success) {
        navigate('/department-dashboard');
      }
    }
  };

  const handleAuthorityChange = (value) => {
    const selectedAuthority = authorities.find(a => a.id === value);
    if (selectedAuthority) {
      setFormData({ ...formData, authorityId: value, email: selectedAuthority.email });
    }
  };

  const handleLevelChange = (value) => {
    setFormData({ ...formData, level: value, state: '', district: '', authorityId: '', email: '' });
    useStore.setState({ states: [], districts: [], authorities: [] });
  };

  const handleStateChange = (value) => {
    setFormData({ ...formData, state: value, district: '', authorityId: '', email: '' });
    useStore.setState({ districts: [], authorities: [] });
  };

  const handleDistrictChange = (value) => {
    setFormData({ ...formData, district: value, authorityId: '', email: '' });
    useStore.setState({ authorities: [] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBack = () => {
    if (step > 1) { 
      // Special case for central: jump from department selection (3) back to level selection (1)
      if (formData.level === 'central' && step === 3) { // From Dept selection back to Level
        setStep(1);
        return;
      }
      // Default back step
      setStep(step - 1);
      return;
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md card-elevated">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Department Registration</CardTitle>
          <CardDescription>
            {step === 1 && 'Step 1: Select Government Level'}
            {step === 2 && 'Step 2: Select Location'}
            {step === 3 && 'Step 3: Select Department'}
            {step === 4 && 'Step 4: Enter Contact Details'}
            {step === 5 && 'Step 5: Verify Your OTP'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && ( // Step 1: Level
              <div className="space-y-2">
                <Label htmlFor="level">Government Level *</Label>
                <Select onValueChange={handleLevelChange} value={formData.level} required>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="central">Central</SelectItem>
                    <SelectItem value="state">State</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && ( // Step 2: Location (State/District)
              <div className="space-y-4">
                {(formData.level === 'state' || formData.level === 'district') && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select onValueChange={handleStateChange} value={formData.state} required>
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.level === 'district' && (
                  <div className="space-y-2">
                    <Label htmlFor="district">District *</Label>
                    <Select onValueChange={handleDistrictChange} value={formData.district} required disabled={!formData.state || districts.length === 0}>
                      <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                      <SelectContent>
                        {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {step === 3 && ( // Step 3: Department
              <div className="space-y-2">
                <Label htmlFor="authorityId">Department Name *</Label>
                <Select onValueChange={handleAuthorityChange} value={formData.authorityId} required disabled={authorities.length === 0}>
                  <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                  <SelectContent>
                    {authorities.map(auth => (
                      <SelectItem key={auth.id} value={auth.id}>{auth.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 4 && ( // Step 4: Details
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Official Email</Label>
                  <Input id="email" type="email" value={formData.email} readOnly disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Number *</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+919876543210" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
            )}

            {step === 5 && ( // Step 5: OTP
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-confirm">Official Email</Label>
                  <Input id="email-confirm" type="email" value={formData.email} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-confirm">Contact Number</Label>
                  <Input id="phone-confirm" type="tel" value={formData.phone} readOnly disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otp">OTP *</Label>
                  <Input id="otp" name="otp" placeholder="Enter 6-digit OTP from console" value={formData.otp} onChange={handleChange} required autoFocus />
                </div>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (step === 4 ? 'Generate OTP' : (step === 5 ? 'Verify & Register' : 'Next'))}
            </Button>

            <Button type="button" variant="outline" onClick={handleBack} className="w-full">Back</Button>

            <p className="text-center text-sm text-muted-foreground">
              Already registered?{' '}
              <Link to="/login" className="text-primary hover:underline">Login here</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentRegister;
/*
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
*/
