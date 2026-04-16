import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/AuthContext";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ActivitySquare } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login: authLogin } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        authLogin(data.token);
        toast({
          title: "Welcome back",
          description: "You have successfully logged in.",
        });
        if (data.user.role === "admin" || data.user.role === "staff") {
          setLocation("/admin");
        } else {
          setLocation("/dashboard");
        }
      },
      onError: (error) => {
        toast({
          title: "Login failed",
          description: error.message || "Please check your credentials.",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Link href="/" className="flex items-center gap-2 font-bold text-2xl text-primary mb-8">
        <ActivitySquare className="w-8 h-8" />
        SmartQueue<span className="text-foreground">AI</span>
      </Link>
      
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
          <div>
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Register here
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-12 flex gap-6 text-2xl opacity-40 grayscale">
        <span>🏥</span>
        <span>🏦</span>
        <span>🎓</span>
        <span>🏛️</span>
        <span>✂️</span>
      </div>
    </div>
  );
}
