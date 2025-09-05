import { motion } from "framer-motion";
import NotificationSettings from "@/components/notification-settings";
import JuiceWatchNotificationTrigger from "@/components/juice-watch-notification-trigger";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl"
              >
                🦍
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  GuerillaGenics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Notification Settings
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Bet Smarter. Go Primal.
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <NotificationSettings />
          <JuiceWatchNotificationTrigger />
        </div>
      </main>
    </div>
  );
}