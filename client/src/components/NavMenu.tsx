import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronDown, 
  Menu, 
  X, 
  Target, 
  Trophy, 
  Users,
  Clock,
  User,
  BookOpen,
  Bell,
  BarChart3,
  Calculator,
  Star
} from "lucide-react";

const navigationConfig = {
  main: [
    {
      label: "Weekly Picks",
      href: "/weekly-picks",
      icon: Target,
      description: "Live matchups & BioBoost picks"
    },
    {
      label: "Top 5 DFS",
      href: "/top5",
      icon: Trophy,
      description: "Elite offensive stars with ggScore"
    },
    {
      label: "Gematria",
      href: "/gematria",
      icon: Calculator,
      description: "Sacred number analysis with BioBoost fusion",
      isPro: true
    },
    {
      label: "Analytics",
      icon: BarChart3,
      hasDropdown: true,
      items: [
        { label: "Leaderboard", href: "/leaderboard", description: "Top contributors & accuracy" },
        { label: "Past Picks", href: "/past-picks", description: "Historical performance archive" }
      ]
    },
    {
      label: "Community",
      icon: Users,
      hasDropdown: true,
      items: [
        { label: "Testimonials", href: "/testimonials", description: "Success stories from the jungle" },
        { label: "Discord Chat", href: "discord", description: "Live community discussions", external: true },
        { label: "Twitter Feed", href: "twitter", description: "Latest jungle updates", external: true }
      ]
    },
    {
      label: "Learn",
      icon: BookOpen,
      hasDropdown: true,
      items: [
        { label: "Blog", href: "/blog", description: "Expert analysis & strategies" },
        { label: "Juice Watch", href: "/alerts", description: "Live line movement alerts" },
        { label: "Betting Education", href: "/education", description: "Strategy & glossary" }
      ]
    },
    {
      label: "Account",
      icon: User,
      hasDropdown: true,
      items: [
        { label: "Dashboard", href: "/dashboard", description: "Your personalized feed" },
        { label: "Profile", href: "/profile", description: "Settings & preferences" }
      ]
    }
  ]
};

export default function NavMenu() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const isActiveRoute = (href: string) => {
    if (href === "/" && location === "/") return true;
    return location.startsWith(href) && href !== "/";
  };

  const isDropdownActive = (items: any[]) => {
    return items.some(item => isActiveRoute(item.href));
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-jungle/10 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-jungle to-vine rounded-lg">
              <span className="text-white text-xl font-bold">🦍</span>
            </div>
            <div>
              <div className="font-bold text-lg text-jungle">GuerillaGenics</div>
              <div className="text-xs text-muted-foreground -mt-1">Bet Smarter. Go Primal.</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationConfig.main.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.hasDropdown ? (
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 h-12 px-4 ${
                      isDropdownActive(item.items || []) 
                        ? 'bg-jungle/10 text-jungle border-b-2 border-jungle' 
                        : 'hover:bg-jungle/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                ) : (
                  <Link href={item.href!}>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 h-12 px-4 ${
                        isActiveRoute(item.href!) 
                          ? 'bg-jungle/10 text-jungle border-b-2 border-jungle' 
                          : 'hover:bg-jungle/5'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                      {item.isPro && (
                        <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-1 py-0">
                          <Star className="w-3 h-3 mr-1" />
                          PRO
                        </Badge>
                      )}
                    </Button>
                  </Link>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.hasDropdown && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-jungle/10 p-2 mt-1"
                    >
                      {item.items?.map((subItem) => (
                        <Link key={subItem.href} href={subItem.href}>
                          <div className={`p-3 rounded-lg hover:bg-jungle/5 transition-colors ${
                            isActiveRoute(subItem.href) ? 'bg-jungle/10' : ''
                          }`}>
                            <div className="font-medium text-jungle">{subItem.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {subItem.description}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="mobile-menu-toggle"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-jungle/10"
            >
              <div className="py-4 space-y-2">
                {navigationConfig.main.map((item) => (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-3"
                          onClick={() => setActiveDropdown(
                            activeDropdown === item.label ? null : item.label
                          )}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                          <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${
                            activeDropdown === item.label ? 'rotate-180' : ''
                          }`} />
                        </Button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-2 space-y-1"
                            >
                              {item.items?.map((subItem) => (
                                <Link 
                                  key={subItem.href} 
                                  href={subItem.href}
                                  onClick={() => setMobileOpen(false)}
                                >
                                  <div className={`p-3 rounded-lg transition-colors ${
                                    isActiveRoute(subItem.href) 
                                      ? 'bg-jungle/10 text-jungle' 
                                      : 'hover:bg-jungle/5'
                                  }`}>
                                    <div className="font-medium">{subItem.label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {subItem.description}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link href={item.href!} onClick={() => setMobileOpen(false)}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 ${
                            isActiveRoute(item.href!) 
                              ? 'bg-jungle/10 text-jungle' 
                              : ''
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                          {item.isPro && (
                            <Badge className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-1 py-0 ml-auto">
                              <Star className="w-3 h-3 mr-1" />
                              PRO
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}