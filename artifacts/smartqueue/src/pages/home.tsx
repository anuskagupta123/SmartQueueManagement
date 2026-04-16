import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Shield, Clock, ArrowRight,
  Hospital, Building2, Scissors, GraduationCap, Landmark, ShoppingCart,
  Zap, BarChart3, QrCode, Smartphone, Activity, CheckCircle
} from "lucide-react";

const FEATURES = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Wait Prediction",
    description: "Dynamic wait time estimates with confidence scoring based on real-time queue data and historical patterns.",
    color: "text-violet-600 bg-violet-50 dark:bg-violet-900/20",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "No-Show Detection",
    description: "Predict no-show probability for each token and automatically reorder the queue to minimize idle time.",
    color: "text-red-600 bg-red-50 dark:bg-red-900/20",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Analytics Dashboard",
    description: "Peak hour heatmaps, no-show rates, staff performance metrics, and daily trend analysis.",
    color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR-Based Arrival",
    description: "Customers scan a QR code at the counter to confirm arrival, reducing no-show probability instantly.",
    color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Smart Prioritization",
    description: "Fair queue algorithm that balances first-come-first-serve with VIP and emergency priorities.",
    color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: "Mobile-First Design",
    description: "Join queues from anywhere. Real-time updates and smart notifications delivered to your phone.",
    color: "text-green-600 bg-green-50 dark:bg-green-900/20",
  },
];

const INDUSTRIES = [
  { icon: <Hospital className="w-5 h-5" />, label: "Hospital", color: "text-rose-600" },
  { icon: <Building2 className="w-5 h-5" />, label: "Bank", color: "text-blue-600" },
  { icon: <Scissors className="w-5 h-5" />, label: "Salon", color: "text-purple-600" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "College", color: "text-amber-600" },
  { icon: <Landmark className="w-5 h-5" />, label: "Government", color: "text-teal-600" },
  { icon: <ShoppingCart className="w-5 h-5" />, label: "Retail", color: "text-orange-600" },
];

const STATS = [
  { value: "98%", label: "Wait time accuracy" },
  { value: "35%", label: "Reduction in no-shows" },
  { value: "2.8x", label: "Faster queue throughput" },
  { value: "4.8/5", label: "Customer satisfaction" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <Activity className="w-6 h-6" />
            SmartQueue<span className="text-foreground">AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 py-24 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 text-xs font-semibold px-3 py-1">
            Powered by AI Queue Intelligence
          </Badge>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            Eliminate the Wait.
            <span className="text-primary"> Empower the Flow.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            SmartQueue AI replaces physical waiting lines with an intelligent virtual queue system.
            Predict wait times with AI, reduce no-shows automatically, and serve more people faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Join a Queue for Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/queues">
              <Button size="lg" variant="outline" className="text-base px-8">
                Browse Queues
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <span className="font-medium">Demo: </span>
            admin@smartqueue.ai / admin123 &nbsp;&middot;&nbsp; alice@example.com / password123
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Built for Every Industry</h2>
          <p className="text-muted-foreground text-sm">One platform, deployed across all service sectors</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((ind) => (
            <div key={ind.label} className="flex items-center gap-2 px-5 py-3 rounded-full border bg-card hover:shadow-sm transition-all">
              <span className={ind.color}>{ind.icon}</span>
              <span className="font-medium text-sm">{ind.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/20 border-y">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Next-Generation Queue Intelligence</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              AI-powered features that make queues smarter, faster, and fairer for everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <Card key={feature.title} className="hover:shadow-md transition-all duration-200 border-border/50">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground">Three steps to a smarter queue</p>
        </div>
        <div className="space-y-6">
          {[
            { step: "01", title: "Register & Find a Queue", desc: "Sign up in seconds, browse available queues by industry or location, and join remotely from your phone." },
            { step: "02", title: "Get Your Digital Token", desc: "Receive a unique token with AI-predicted wait time and confidence level. Monitor your position in real-time." },
            { step: "03", title: "Arrive When Called", desc: "Get notified when it's your turn. Show your QR code at the counter to confirm arrival and be served instantly." },
          ].map((step) => (
            <div key={step.step} className="flex gap-6 items-start">
              <div className="text-4xl font-black text-primary/30 w-16 shrink-0 text-right">{step.step}</div>
              <div className="border-l-2 pl-6 pb-6 border-primary/20">
                <h3 className="font-bold text-lg mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to eliminate the wait?</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands of businesses and customers using SmartQueue AI to reclaim lost time.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg">Start for Free</Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline">Admin Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 font-semibold text-foreground mb-2">
            <Activity className="w-4 h-4 text-primary" />
            SmartQueue AI
          </div>
          <p>Intelligent Virtual Queue &amp; Wait-Time Optimization System</p>
        </div>
      </footer>
    </div>
  );
}
