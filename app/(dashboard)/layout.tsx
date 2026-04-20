import { Navigation } from "@/components/navigation"
import { AlertBanner } from "@/components/alert-banner"

// Mock user for demo - replace with actual auth
const mockUser = {
  name: "Abebe Bekele",
  email: "abebe@example.com",
  role: "farmer" as const,
}

// Mock alerts for demo
const mockAlerts = [
  {
    id: "1",
    type: "flood" as const,
    severity: "warning" as const,
    title: "Flood Warning",
    message: "Heavy rainfall expected in low-lying areas of Harar. Take precautionary measures.",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AlertBanner alerts={mockAlerts} />
      <Navigation user={mockUser} />
      <main>{children}</main>
    </div>
  )
}
