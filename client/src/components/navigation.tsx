import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Menu, X, TrendingUp, Bell, Zap, Home, Target, Brain, Trophy } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
      description: "Return to landing page"
    },
    {
      name: "Week 1 NFL", 
      href: "/week1",
      icon: TrendingUp,
      description: "Week 1 NFL betting lines"
    },
    {
      name: "Strategy", 
      href: "/strategy",
      icon: Target,
      description: "Personalized betting strategies"
    },
    {
      name: "Risk Heatmap",
      href: "/risk-heatmap", 
      icon: Brain,
      description: "Dynamic AI risk analysis"
    },
    {
      name: "Challenges",
      href: "/challenges",
      icon: Trophy,
      description: "Social betting challenges"
    },
    {
      name: "Live Dashboard", 
      href: "/dashboard",
      icon: TrendingUp,
      description: "Over/Under betting dashboard"
    },
    {
      name: "Setup Wizard",
      href: "/wizard", 
      icon: Zap,
      description: "Personalize your experience"
    },
    {
      name: "Notifications",
      href: "/notifications",
      icon: Bell,
      description: "Juice Watch alerts"
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl">🦍</span>
              <span className="font-bold text-lg text-primary">GuerillaGenics</span>
            </Link>

            {/* Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "inline-flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            isActive && "bg-accent text-accent-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* CTA Button */}
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link href="/week1">
                🦍 Enter the Jungle
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl">🦍</span>
              <span className="font-bold text-lg text-primary">GuerillaGenics</span>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="pb-4 border-t border-border mt-1">
              <div className="flex flex-col space-y-2 pt-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div>{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
                
                {/* Mobile CTA */}
                <div className="pt-2">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      🦍 Enter the Jungle
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className="h-16" />
    </>
  );
}