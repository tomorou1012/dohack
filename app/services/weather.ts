import axios from 'axios';
import { Coordinates } from './geolocation';

export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    windSpeed: number;
    humidity: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature: number[];
    precipitation: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    temperatureMax: number[];
    temperatureMin: number[];
    weatherCode: number[];
    precipitationSum: number[];
  };
}

export interface WeatherAlert {
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  description: string;
  areas: string[];
  start: string;
  end: string;
}

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1';

export const getWeatherData = async (coordinates: Coordinates): Promise<WeatherData> => {
  try {
    const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
      params: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        current: 'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m',
        hourly: 'temperature_2m,precipitation,weather_code',
        daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum',
        timezone: 'Asia/Tokyo',
        forecast_days: 7,
      },
    });

    const data = response.data;
    
    return {
      current: {
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        humidity: data.current.relative_humidity_2m,
        time: data.current.time,
      },
      hourly: {
        time: data.hourly.time.slice(0, 24), // Next 24 hours
        temperature: data.hourly.temperature_2m.slice(0, 24).map((t: number) => Math.round(t)),
        precipitation: data.hourly.precipitation.slice(0, 24),
        weatherCode: data.hourly.weather_code.slice(0, 24),
      },
      daily: {
        time: data.daily.time,
        temperatureMax: data.daily.temperature_2m_max.map((t: number) => Math.round(t)),
        temperatureMin: data.daily.temperature_2m_min.map((t: number) => Math.round(t)),
        weatherCode: data.daily.weather_code,
        precipitationSum: data.daily.precipitation_sum,
      },
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw new Error('天気情報の取得に失敗しました');
  }
};

export const getWeatherDescription = (weatherCode: number): string => {
  const weatherCodes: { [key: number]: string } = {
    0: '快晴',
    1: '晴れ',
    2: '薄雲',
    3: '曇り',
    45: '霧',
    48: '着氷霧',
    51: '弱い霧雨',
    53: '霧雨',
    55: '強い霧雨',
    56: '弱い着氷霧雨',
    57: '強い着氷霧雨',
    61: '弱い雨',
    63: '雨',
    65: '強い雨',
    66: '弱い着氷雨',
    67: '強い着氷雨',
    71: '弱い雪',
    73: '雪',
    75: '強い雪',
    77: '雪片',
    80: '弱いにわか雨',
    81: 'にわか雨',
    82: '強いにわか雨',
    85: '弱いにわか雪',
    86: '強いにわか雪',
    95: '雷雨',
    96: '雹を伴う弱い雷雨',
    99: '雹を伴う強い雷雨',
  };

  return weatherCodes[weatherCode] || '不明';
};

export const getWeatherIcon = (weatherCode: number): string => {
  if (weatherCode === 0) return '☀️';
  if (weatherCode <= 3) return '🌤️';
  if (weatherCode <= 48) return '🌫️';
  if (weatherCode <= 57) return '🌦️';
  if ([61, 63, 65, 80, 81, 82].includes(weatherCode)) return '🌧️';
  if (weatherCode >= 66 && weatherCode <= 67) return '🌨️';
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return '❄️';
  if (weatherCode >= 95) return '⛈️';
  return '🌤️';
};

export const isHazardousWeather = (weatherCode: number): boolean => {
  // 危険な天候パターン
  const hazardousCodes = [65, 67, 75, 82, 86, 95, 96, 99];
  return hazardousCodes.includes(weatherCode);
};

// Mock function for disaster alerts - in a real app, this would integrate with JMA (Japan Meteorological Agency) API
export const getDisasterAlerts = async (coordinates: Coordinates): Promise<WeatherAlert[]> => {
  // This is a mock implementation. In a real scenario, you would integrate with:
  // - Japan Meteorological Agency (JMA) API
  // - Local government alert systems
  // - Emergency broadcasting systems
  
  const mockAlerts: WeatherAlert[] = [];
  
  // Check current weather for potential alerts
  try {
    const weather = await getWeatherData(coordinates);
    
    if (isHazardousWeather(weather.current.weatherCode)) {
      mockAlerts.push({
        event: '悪天候警報',
        severity: 'moderate',
        description: '現在の天候状況により外出時は注意が必要です。',
        areas: ['現在地周辺'],
        start: new Date().toISOString(),
        end: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
      });
    }
    
    // Check for heavy rain in forecast
    const hasHeavyRain = weather.hourly.precipitation.some(p => p > 10);
    if (hasHeavyRain) {
      mockAlerts.push({
        event: '大雨注意報',
        severity: 'moderate',
        description: '今後数時間以内に大雨が予想されます。浸水や土砂災害にご注意ください。',
        areas: ['現在地周辺'],
        start: new Date().toISOString(),
        end: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
      });
    }
  } catch (error) {
    console.error('Error checking for alerts:', error);
  }
  
  return mockAlerts;
};