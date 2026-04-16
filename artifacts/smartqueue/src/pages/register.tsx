import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ActivitySquare } from "lucide-react";
import { RegisterBodyRole } from "@workspace/api-client-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<RegisterBodyRole>(RegisterBodyRole.customer);
  
  const { login: authLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        authLogin(data.token);
        toast({
          title: "Account created",
          description: "Welcome to SmartQueue AI.",
        });
        if (data.user.role === "admin" || data.user.role === "staff") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: (error) => {
        toast({
          title: "Registration failed",
          description: error.message || "Please check your information.",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ 
      data: { 
        name, 
        email, 
        password, 
        phone: phone || undefined, 
        role 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 py-12">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary mb-8">
        <ActivitySquare className="w-8 h-8" />
        SmartQueue<span className="text-foreground">AI</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="+1 (555) 000-0000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as RegisterBodyRole)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RegisterBodyRole.customer}>Customer</SelectItem>
                  <SelectItem value={RegisterBodyRole.staff}>Staff</SelectItem>
                  <SelectItem value={RegisterBodyRole.admin}>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              className="w-full mt-2" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
