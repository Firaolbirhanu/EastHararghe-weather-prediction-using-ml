-- Weather Prediction Platform Database Schema
-- This script creates the core tables for the East Hararge Weather Prediction System

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('resident', 'farmer', 'official', 'admin')) DEFAULT 'resident',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 2. Locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  elevation_m INTEGER,
  region TEXT DEFAULT 'Eastern Hararge',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations_select_all" ON public.locations FOR SELECT TO authenticated USING (true);

-- Insert default locations for Eastern Hararge
INSERT INTO public.locations (name, latitude, longitude, elevation_m) VALUES
  ('Harar City', 9.3115, 42.1197, 1885),
  ('Gursum', 9.3556, 42.4167, 1850),
  ('Babile', 9.2333, 42.3167, 1650),
  ('Fedis', 9.1333, 42.0500, 1600),
  ('Kombolcha', 9.4667, 42.1167, 1900),
  ('Jarso', 9.2833, 42.5833, 1750),
  ('Chinaksen', 9.1000, 42.6000, 1800),
  ('Midega Tola', 9.1500, 42.2500, 1700),
  ('Kersa', 9.3667, 41.9167, 2050),
  ('Haramaya', 9.4000, 42.0000, 2000)
ON CONFLICT (name) DO NOTHING;

-- 3. Weather observations table (actual recorded data)
CREATE TABLE IF NOT EXISTS public.weather_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  observed_at TIMESTAMPTZ NOT NULL,
  temperature_c DECIMAL(5, 2),
  feels_like_c DECIMAL(5, 2),
  humidity_pct INTEGER,
  wind_speed_kmh DECIMAL(6, 2),
  wind_direction TEXT,
  pressure_hpa DECIMAL(7, 2),
  rainfall_mm DECIMAL(6, 2),
  visibility_km DECIMAL(6, 2),
  uv_index INTEGER,
  condition TEXT,
  source TEXT DEFAULT 'sensor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, observed_at)
);

ALTER TABLE public.weather_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "observations_select_all" ON public.weather_observations FOR SELECT TO authenticated USING (true);

-- 4. Weather predictions table (ML model outputs)
CREATE TABLE IF NOT EXISTS public.weather_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  prediction_time TIMESTAMPTZ NOT NULL,
  target_time TIMESTAMPTZ NOT NULL,
  model_version TEXT NOT NULL,
  temperature_c DECIMAL(5, 2),
  humidity_pct INTEGER,
  wind_speed_kmh DECIMAL(6, 2),
  rainfall_mm DECIMAL(6, 2),
  rainfall_probability_pct INTEGER,
  condition TEXT,
  confidence_score DECIMAL(5, 4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(location_id, target_time, model_version)
);

ALTER TABLE public.weather_predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "predictions_select_all" ON public.weather_predictions FOR SELECT TO authenticated USING (true);

-- 5. Weather alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('flood', 'storm', 'heat', 'cold', 'drought', 'wind', 'general')),
  severity TEXT NOT NULL CHECK (severity IN ('advisory', 'watch', 'warning', 'emergency')),
  title TEXT NOT NULL,
  description TEXT,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_select_all" ON public.weather_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "alerts_insert_officials" ON public.weather_alerts FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
  );
CREATE POLICY "alerts_update_officials" ON public.weather_alerts FOR UPDATE TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('official', 'admin'))
  );

-- 6. User prediction history (saved searches/queries)
CREATE TABLE IF NOT EXISTS public.user_prediction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  query_params JSONB,
  prediction_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_prediction_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_select_own" ON public.user_prediction_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history_insert_own" ON public.user_prediction_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_delete_own" ON public.user_prediction_history FOR DELETE USING (auth.uid() = user_id);

-- 7. User preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_location_id UUID REFERENCES public.locations(id),
  temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  alert_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = id);
CREATE POLICY "preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = id);

-- 8. Model metrics table (tracks ML model performance)
CREATE TABLE IF NOT EXISTS public.model_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version TEXT NOT NULL,
  metric_date DATE NOT NULL,
  mae_temperature DECIMAL(6, 4),
  mae_humidity DECIMAL(6, 4),
  mae_rainfall DECIMAL(6, 4),
  accuracy_condition DECIMAL(5, 4),
  total_predictions INTEGER,
  evaluated_predictions INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(model_version, metric_date)
);

ALTER TABLE public.model_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "metrics_select_all" ON public.model_metrics FOR SELECT TO authenticated USING (true);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, location)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'resident'),
    COALESCE(NEW.raw_user_meta_data ->> 'location', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Also create default preferences
  INSERT INTO public.user_preferences (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Helper function to get active alerts for a location
CREATE OR REPLACE FUNCTION public.get_active_alerts(p_location_id UUID DEFAULT NULL)
RETURNS SETOF public.weather_alerts
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.weather_alerts
  WHERE is_active = true
    AND valid_from <= NOW()
    AND valid_until >= NOW()
    AND (p_location_id IS NULL OR location_id = p_location_id OR location_id IS NULL)
  ORDER BY 
    CASE severity 
      WHEN 'emergency' THEN 1 
      WHEN 'warning' THEN 2 
      WHEN 'watch' THEN 3 
      WHEN 'advisory' THEN 4 
    END,
    valid_from DESC;
$$;
