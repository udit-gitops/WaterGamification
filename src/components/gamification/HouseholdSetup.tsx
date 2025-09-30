import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, MapPin, Gauge } from "lucide-react";

interface HouseholdSetupProps {
  onSetup: (data: {
    household_name: string;
    address?: string;
    smart_meter_id?: string;
    neighborhood?: string;
  }) => Promise<any>;
  loading?: boolean;
}

export function HouseholdSetup({ onSetup, loading }: HouseholdSetupProps) {
  const [formData, setFormData] = useState({
    household_name: '',
    address: '',
    smart_meter_id: '',
    neighborhood: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.household_name.trim()) return;
    
    await onSetup({
      household_name: formData.household_name,
      address: formData.address || undefined,
      smart_meter_id: formData.smart_meter_id || undefined,
      neighborhood: formData.neighborhood || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 text-6xl">🏠</div>
          <CardTitle className="text-2xl">Setup Your Household</CardTitle>
          <CardDescription>
            Let's get your smart water management system configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="household_name" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Household Name *</span>
              </Label>
              <Input
                id="household_name"
                placeholder="e.g., Smith Family Home"
                value={formData.household_name}
                onChange={(e) => setFormData(prev => ({ ...prev, household_name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address</span>
              </Label>
              <Input
                id="address"
                placeholder="123 Water St, Conservation City"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Neighborhood</span>
              </Label>
              <Input
                id="neighborhood"
                placeholder="e.g., Green Valley"
                value={formData.neighborhood}
                onChange={(e) => setFormData(prev => ({ ...prev, neighborhood: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smart_meter_id" className="flex items-center space-x-2">
                <Gauge className="h-4 w-4" />
                <span>Smart Meter ID</span>
              </Label>
              <Input
                id="smart_meter_id"
                placeholder="e.g., SM-12345678"
                value={formData.smart_meter_id}
                onChange={(e) => setFormData(prev => ({ ...prev, smart_meter_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Find this on your smart water meter device
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !formData.household_name.trim()}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}