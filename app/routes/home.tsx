import { useState, useEffect } from "react";
import { Link } from "react-router";
import type { Route } from "./+types/home";
import Layout from "../components/Layout";
import { getCurrentPosition, type Coordinates } from "../services/geolocation";
import { getWeatherData, getDisasterAlerts, getWeatherDescription, getWeatherIcon, type WeatherData, type WeatherAlert } from "../services/weather";
import { MapPin, MessageCircle, Shield, AlertTriangle, Navigation, Phone } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SafeBridge - 災害時AIガイド" },
    { name: "description", content: "災害時の迅速な避難をサポートする総合ガイドアプリ" },
  ];
}

export default function Home() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Get current location
        const coordinates = await getCurrentPosition();
        setLocation(coordinates);
        
        // Get weather data
        const weatherData = await getWeatherData(coordinates);
        setWeather(weatherData);
        
        // Get disaster alerts
        const alertData = await getDisasterAlerts(coordinates);
        setAlerts(alertData);
        
      } catch (err) {
        console.error('Error initializing data:', err);
        setError(err instanceof Error ? err.message : '初期化に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-600 text-white';
      case 'severe': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'minor': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const quickActions = [
    {
      to: "/map",
      icon: MapPin,
      title: "避難所マップ",
      description: "最寄りの避難所を確認",
      color: "bg-green-600",
    },
    {
      to: "/ai-guide",
      icon: Shield,
      title: "AIガイド",
      description: "避難アドバイスを取得",
      color: "bg-purple-600",
    },
    {
      to: "/chat",
      icon: MessageCircle,
      title: "AI相談",
      description: "チャットで状況を相談",
      color: "bg-orange-600",
    },
  ];

  return (
    <Layout>
      <div className="p-4 space-y-6">
        {/* Emergency Contacts */}
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone size={24} />
              <div>
                <h2 className="font-bold text-lg">緊急連絡先</h2>
                <p className="text-sm">生命に関わる緊急事態の場合</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">119</div>
              <div className="text-sm">消防・救急</div>
            </div>
          </div>
        </div>

        {/* Disaster Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <AlertTriangle className="mr-2 text-red-500" size={24} />
              災害警報・注意報
            </h2>
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg shadow-md ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{alert.event}</h3>
                  <span className="text-xs opacity-90">
                    {format(new Date(alert.start), 'HH:mm', { locale: ja })}
                  </span>
                </div>
                <p className="mb-2">{alert.description}</p>
                <p className="text-xs opacity-90">対象地域: {alert.areas.join(', ')}</p>
              </div>
            ))}
          </div>
        )}

        {/* Weather Information */}
        {weather && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">現在の天気</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">
                  {getWeatherIcon(weather.current.weatherCode)}
                </div>
                <div>
                  <div className="text-2xl font-bold">{weather.current.temperature}°C</div>
                  <div className="text-gray-600">
                    {getWeatherDescription(weather.current.weatherCode)}
                  </div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>風速: {weather.current.windSpeed} m/s</div>
                <div>湿度: {weather.current.humidity}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800">クイックアクション</h2>
          <div className="grid gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`${action.color} text-white p-4 rounded-lg shadow-md hover:opacity-90 transition-opacity`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={24} />
                    <div>
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Location Status */}
        {location && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-800">
              <Navigation size={16} />
              <span className="text-sm font-medium">
                現在地: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-gray-100 p-8 rounded-lg text-center">
            <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600">位置情報と天気データを取得中...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle size={16} />
              <span className="font-medium">エラー</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              位置情報を許可して、ページを再読み込みしてください。
            </p>
          </div>
        )}

        {/* Safety Tips */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">安全のための準備</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 非常用持ち出し袋の準備</li>
            <li>• 家族との連絡手段の確認</li>
            <li>• 避難経路の事前確認</li>
            <li>• 緊急時の集合場所の決定</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}