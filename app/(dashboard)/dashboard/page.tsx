"use client"

import { WeatherCard, WeatherStatCard } from "@/components/weather-card"
import { TemperatureChart, RainfallChart, HumidityWindChart } from "@/components/forecast-chart"
import { HourlyForecast, DailyForecast } from "@/components/hourly-forecast"
import { AlertList } from "@/components/alert-banner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MapPin, RefreshCw, Download, Brain, TrendingUp } from "lucide-react"
import { useState } from "react"

// Mock weather data
const currentWeather = {
  location: "Harar City",
  temperature: 28,
  condition: "partly-cloudy" as const,
  humidity: 65,
  windSpeed: 12,
  pressure: 1015,
  feelsLike: 30,
}

const hourlyData = [
  { time: "Now", temperature: 28, condition: "partly-cloudy" as const, precipitation: 10 },
  { time: "14:00", temperature: 29, condition: "partly-cloudy" as const, precipitation: 15 },
  { time: "15:00", temperature: 30, condition: "sunny" as const, precipitation: 5 },
  { time: "16:00", temperature: 29, condition: "cloudy" as const, precipitation: 20 },
  { time: "17:00", temperature: 27, condition: "cloudy" as const, precipitation: 35 },
  { time: "18:00", temperature: 25, condition: "rainy" as const, precipitation: 60 },
  { time: "19:00", temperature: 23, condition: "rainy" as const, precipitation: 70 },
  { time: "20:00", temperature: 22, condition: "cloudy" as const, precipitation: 40 },
  { time: "21:00", temperature: 21, condition: "cloudy" as const, precipitation: 25 },
  { time: "22:00", temperature: 20, condition: "partly-cloudy" as const, precipitation: 10 },
]

const dailyData = [
  { day: "Today", date: "Apr 19", high: 30, low: 18, condition: "partly-cloudy" as const, precipitation: 30 },
  { day: "Sunday", date: "Apr 20", high: 28, low: 17, condition: "rainy" as const, precipitation: 70 },
  { day: "Monday", date: "Apr 21", high: 26, low: 16, condition: "rainy" as const, precipitation: 85 },
  { day: "Tuesday", date: "Apr 22", high: 27, low: 17, condition: "cloudy" as const, precipitation: 40 },
  { day: "Wednesday", date: "Apr 23", high: 29, low: 18, condition: "partly-cloudy" as const, precipitation: 20 },
  { day: "Thursday", date: "Apr 24", high: 31, low: 19, condition: "sunny" as const, precipitation: 5 },
  { day: "Friday", date: "Apr 25", high: 32, low: 20, condition: "sunny" as const, precipitation: 0 },
]

const temperatureChartData = [
  { date: "Mon", high: 28, low: 18, predicted: 27 },
  { date: "Tue", high: 30, low: 19, predicted: 29 },
  { date: "Wed", high: 26, low: 17, predicted: 25 },
  { date: "Thu", high: 27, low: 18, predicted: 26 },
  { date: "Fri", high: 29, low: 19, predicted: 28 },
  { date: "Sat", high: 31, low: 20, predicted: 30 },
  { date: "Sun", high: 28, low: 18, predicted: 27 },
]

const rainfallChartData = [
  { date: "Mon", rainfall: 5, predicted: 6 },
  { date: "Tue", rainfall: 12, predicted: 10 },
  { date: "Wed", rainfall: 35, predicted: 38 },
  { date: "Thu", rainfall: 28, predicted: 25 },
  { date: "Fri", rainfall: 8, predicted: 10 },
  { date: "Sat", rainfall: 2, predicted: 3 },
  { date: "Sun", rainfall: 15, predicted: 18 },
]

const humidityWindData = [
  { time: "00:00", humidity: 75, windSpeed: 8 },
  { time: "04:00", humidity: 80, windSpeed: 6 },
  { time: "08:00", humidity: 70, windSpeed: 10 },
  { time: "12:00", humidity: 55, windSpeed: 14 },
  { time: "16:00", humidity: 60, windSpeed: 12 },
  { time: "20:00", humidity: 72, windSpeed: 9 },
]

const activeAlerts = [
  {
    id: "1",
    type: "flood" as const,
    severity: "warning" as const,
    title: "Flash Flood Warning",
    description: "Heavy rainfall may cause flash flooding in low-lying areas. Avoid streams and drainage areas.",
    location: "Harar City, Fedis",
    validUntil: "Apr 20, 2026 18:00",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "storm" as const,
    severity: "watch" as const,
    title: "Thunderstorm Watch",
    description: "Conditions favorable for thunderstorms this evening. Lightning and strong winds possible.",
    location: "Eastern Hararge Region",
    validUntil: "Apr 19, 2026 23:00",
    timestamp: "5 hours ago",
  },
]

const locations = [
  "Harar City",
  "Gursum",
  "Babile",
  "Fedis",
  "Kombolcha",
  "Jarso",
  "Chinaksen",
]

export default function DashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState("Harar City")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Weather Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time weather data and ML predictions for Eastern Hararge
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px]">
              <MapPin className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ML Prediction Badge */}
      <div className="mt-4 flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <Brain className="h-3 w-3" />
          ML-Powered Predictions
        </Badge>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          94.5% Accuracy
        </Badge>
        <span className="text-xs text-muted-foreground">
          Last updated: 5 minutes ago
        </span>
      </div>

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <WeatherStatCard
          title="Temperature"
          value={currentWeather.temperature}
          unit="°C"
          icon="temperature"
          trend={{ value: 2.3, direction: "up" }}
        />
        <WeatherStatCard
          title="Humidity"
          value={currentWeather.humidity}
          unit="%"
          icon="humidity"
          trend={{ value: 5, direction: "down" }}
        />
        <WeatherStatCard
          title="Wind Speed"
          value={currentWeather.windSpeed}
          unit="km/h"
          icon="wind"
        />
        <WeatherStatCard
          title="Pressure"
          value={currentWeather.pressure}
          unit="hPa"
          icon="pressure"
        />
      </div>

      {/* Main Content Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Weather & Alerts */}
        <div className="space-y-6 lg:col-span-1">
          <WeatherCard {...currentWeather} />
          <AlertList alerts={activeAlerts} />
        </div>

        {/* Right Column - Charts & Forecasts */}
        <div className="space-y-6 lg:col-span-2">
          <HourlyForecast data={hourlyData} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <TemperatureChart data={temperatureChartData} />
            <RainfallChart data={rainfallChartData} />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <HumidityWindChart data={humidityWindData} />
            <DailyForecast data={dailyData} />
          </div>
        </div>
      </div>

      {/* Recommendations Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI-Powered Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium">Agricultural Advisory</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Heavy rain expected tomorrow. Consider delaying field work and
                ensure proper drainage for crops.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium">Travel Advisory</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Road conditions may be affected by rain. Plan for longer travel
                times and avoid low-lying routes.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium">Health Advisory</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                High humidity levels expected. Stay hydrated and avoid
                prolonged outdoor activities during peak hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
