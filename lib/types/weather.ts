// Weather Prediction Platform TypeScript Types

export type UserRole = 'resident' | 'farmer' | 'official' | 'admin'
export type AlertType = 'flood' | 'storm' | 'heat' | 'cold' | 'drought' | 'wind' | 'general'
export type AlertSeverity = 'advisory' | 'watch' | 'warning' | 'emergency'
export type TemperatureUnit = 'celsius' | 'fahrenheit'
export type ThemePreference = 'light' | 'dark' | 'system'
export type WeatherCondition = 
  | 'sunny' 
  | 'partly_cloudy' 
  | 'cloudy' 
  | 'overcast'
  | 'light_rain' 
  | 'rain' 
  | 'heavy_rain'
  | 'thunderstorm'
  | 'fog'
  | 'clear'

// Database models
export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  location: string | null
  created_at: string
  updated_at: string
}

export interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  elevation_m: number | null
  region: string
  created_at: string
}

export interface WeatherObservation {
  id: string
  location_id: string
  observed_at: string
  temperature_c: number | null
  feels_like_c: number | null
  humidity_pct: number | null
  wind_speed_kmh: number | null
  wind_direction: string | null
  pressure_hpa: number | null
  rainfall_mm: number | null
  visibility_km: number | null
  uv_index: number | null
  condition: string | null
  source: string
  created_at: string
  // Joined data
  location?: Location
}

export interface WeatherPrediction {
  id: string
  location_id: string
  prediction_time: string
  target_time: string
  model_version: string
  temperature_c: number | null
  humidity_pct: number | null
  wind_speed_kmh: number | null
  rainfall_mm: number | null
  rainfall_probability_pct: number | null
  condition: string | null
  confidence_score: number | null
  created_at: string
  // Joined data
  location?: Location
}

export interface WeatherAlert {
  id: string
  location_id: string | null
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  description: string | null
  valid_from: string
  valid_until: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined data
  location?: Location
}

export interface UserPredictionHistory {
  id: string
  user_id: string
  location_id: string
  query_params: Record<string, unknown> | null
  prediction_summary: PredictionSummary | null
  created_at: string
  // Joined data
  location?: Location
}

export interface UserPreferences {
  id: string
  default_location_id: string | null
  temperature_unit: TemperatureUnit
  alert_notifications: boolean
  email_notifications: boolean
  theme: ThemePreference
  created_at: string
  updated_at: string
  // Joined data
  default_location?: Location
}

export interface ModelMetrics {
  id: string
  model_version: string
  metric_date: string
  mae_temperature: number | null
  mae_humidity: number | null
  mae_rainfall: number | null
  accuracy_condition: number | null
  total_predictions: number | null
  evaluated_predictions: number | null
  created_at: string
}

// API Request/Response Types
export interface PredictionRequest {
  location_id: string
  forecast_days?: number // 1-7 days
  include_hourly?: boolean
}

export interface PredictionSummary {
  location: Location
  current: CurrentWeather
  hourly: HourlyForecast[]
  daily: DailyForecast[]
  model_version: string
  generated_at: string
  confidence: number
}

export interface CurrentWeather {
  temperature_c: number
  feels_like_c: number
  humidity_pct: number
  wind_speed_kmh: number
  wind_direction: string
  pressure_hpa: number
  visibility_km: number
  uv_index: number
  condition: WeatherCondition
  description: string
}

export interface HourlyForecast {
  time: string
  temperature_c: number
  humidity_pct: number
  wind_speed_kmh: number
  rainfall_mm: number
  rainfall_probability_pct: number
  condition: WeatherCondition
}

export interface DailyForecast {
  date: string
  temp_high_c: number
  temp_low_c: number
  humidity_avg_pct: number
  wind_speed_max_kmh: number
  rainfall_total_mm: number
  rainfall_probability_pct: number
  condition: WeatherCondition
  description: string
  sunrise: string
  sunset: string
}

// ML API Types
export interface MLPredictionInput {
  location_id: string
  latitude: number
  longitude: number
  elevation_m: number
  historical_data: WeatherObservation[]
  target_dates: string[]
}

export interface MLPredictionOutput {
  predictions: Array<{
    target_time: string
    temperature_c: number
    humidity_pct: number
    wind_speed_kmh: number
    rainfall_mm: number
    rainfall_probability_pct: number
    condition: WeatherCondition
    confidence_score: number
  }>
  model_version: string
  processing_time_ms: number
}

// Dashboard Widget Types
export interface WeatherCardData {
  location: Location
  current: CurrentWeather
  forecast: DailyForecast[]
  alerts: WeatherAlert[]
  lastUpdated: string
}

export interface MapMarker {
  id: string
  location: Location
  current_temp: number
  condition: WeatherCondition
  has_alert: boolean
}

// Form Types
export interface SignUpFormData {
  email: string
  password: string
  full_name: string
  role: UserRole
  location?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface AlertFormData {
  location_id: string | null
  alert_type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  valid_from: string
  valid_until: string
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number
}

// Utility types
export type WithLocation<T> = T & { location: Location }

export function getConditionIcon(condition: WeatherCondition | string): string {
  const icons: Record<string, string> = {
    sunny: 'sun',
    partly_cloudy: 'cloud-sun',
    cloudy: 'cloud',
    overcast: 'clouds',
    light_rain: 'cloud-drizzle',
    rain: 'cloud-rain',
    heavy_rain: 'cloud-rain-wind',
    thunderstorm: 'cloud-lightning',
    fog: 'cloud-fog',
    clear: 'moon',
  }
  return icons[condition] || 'cloud'
}

export function getConditionDescription(condition: WeatherCondition | string): string {
  const descriptions: Record<string, string> = {
    sunny: 'Sunny',
    partly_cloudy: 'Partly Cloudy',
    cloudy: 'Cloudy',
    overcast: 'Overcast',
    light_rain: 'Light Rain',
    rain: 'Rain',
    heavy_rain: 'Heavy Rain',
    thunderstorm: 'Thunderstorm',
    fog: 'Foggy',
    clear: 'Clear',
  }
  return descriptions[condition] || 'Unknown'
}

export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32)
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    return `${celsiusToFahrenheit(celsius)}°F`
  }
  return `${Math.round(celsius)}°C`
}

export function getSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    advisory: 'bg-blue-500',
    watch: 'bg-yellow-500',
    warning: 'bg-orange-500',
    emergency: 'bg-red-500',
  }
  return colors[severity]
}
