import { useState, useEffect } from "react";
import type { Route } from "./+types/map";
import Layout from "../components/Layout";
import { getCurrentPosition, type Coordinates } from "../services/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { MapPin, Navigation, Phone, Clock, Users } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "避難所マップ - SafeBridge" },
    { name: "description", content: "現在地周辺の避難所を地図で確認できます" },
  ];
}

// Custom icons for different types of shelters
const createIcon = (color: string) => new Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="7" fill="white"/>
    </svg>
  `)}`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const shelterIcon = createIcon('#ef4444');
const schoolIcon = createIcon('#3b82f6');
const communityIcon = createIcon('#10b981');
const userIcon = createIcon('#6366f1');

export interface Shelter {
  id: number;
  name: string;
  type: '避難所' | '小学校' | '中学校' | '高等学校' | '公民館' | 'コミュニティセンター';
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  facilities: string[];
  phoneNumber?: string;
  isOpen: boolean;
  evacuationArea: '洪水' | '地震' | '土砂災害' | '津波' | '全災害';
}

// Mock shelter data - In a real app, this would come from a government API or database
const mockShelters: Shelter[] = [
  {
    id: 1,
    name: "東京都立大学体育館",
    type: "避難所",
    address: "東京都八王子市南大沢1-1",
    latitude: 35.6195,
    longitude: 139.3684,
    capacity: 800,
    facilities: ["水道", "電気", "トイレ", "医療設備"],
    phoneNumber: "042-677-1111",
    isOpen: true,
    evacuationArea: "全災害",
  },
  {
    id: 2,
    name: "南大沢小学校",
    type: "小学校",
    address: "東京都八王子市南大沢2-2",
    latitude: 35.6215,
    longitude: 139.3704,
    capacity: 400,
    facilities: ["水道", "電気", "トイレ"],
    isOpen: true,
    evacuationArea: "地震",
  },
  {
    id: 3,
    name: "南大沢コミュニティセンター",
    type: "コミュニティセンター",
    address: "東京都八王子市南大沢3-3",
    latitude: 35.6175,
    longitude: 139.3664,
    capacity: 200,
    facilities: ["水道", "電気", "トイレ", "調理設備"],
    phoneNumber: "042-677-2222",
    isOpen: true,
    evacuationArea: "洪水",
  },
  {
    id: 4,
    name: "首都大学東京体育館",
    type: "避難所",
    address: "東京都八王子市南大沢1-5",
    latitude: 35.6165,
    longitude: 139.3714,
    capacity: 600,
    facilities: ["水道", "電気", "トイレ", "シャワー", "医療設備"],
    isOpen: false,
    evacuationArea: "全災害",
  },
];

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  
  return null;
}

export default function MapPage() {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const coordinates = await getCurrentPosition();
        setLocation(coordinates);
      } catch (err) {
        console.error('Error getting location:', err);
        setError(err instanceof Error ? err.message : '位置情報の取得に失敗しました');
        // Default to Tokyo if location fails
        setLocation({ latitude: 35.6195, longitude: 139.3684 });
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const getIcon = (shelter: Shelter) => {
    if (shelter.type === '避難所') return shelterIcon;
    if (shelter.type.includes('学校')) return schoolIcon;
    return communityIcon;
  };

  const getSeverityColor = (evacuationArea: string) => {
    switch (evacuationArea) {
      case '全災害': return 'text-red-600';
      case '津波': return 'text-blue-600';
      case '洪水': return 'text-blue-500';
      case '地震': return 'text-orange-600';
      case '土砂災害': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const nearestShelters = location ? 
    [...mockShelters]
      .map(shelter => ({
        ...shelter,
        distance: calculateDistance(
          location.latitude, 
          location.longitude, 
          shelter.latitude, 
          shelter.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) : [];

  if (loading) {
    return (
      <Layout>
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin mx-auto mb-4 w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-gray-600">地図を読み込み中...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!location && error) {
    return (
      <Layout>
        <div className="p-4">
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <h2 className="font-bold text-red-800 mb-2">位置情報エラー</h2>
            <p className="text-red-700">{error}</p>
            <p className="text-red-600 text-sm mt-2">
              ブラウザの設定で位置情報を許可してください。
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col h-screen">
        {/* Map Container */}
        <div className="flex-1 relative">
          {location && (
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <MapController center={[location.latitude, location.longitude]} />
              
              {/* User Location Marker */}
              <Marker position={[location.latitude, location.longitude]} icon={userIcon}>
                <Popup>
                  <div className="text-center">
                    <strong>現在地</strong>
                    <br />
                    <small>
                      {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </small>
                  </div>
                </Popup>
              </Marker>

              {/* Shelter Markers */}
              {mockShelters.map((shelter) => (
                <Marker
                  key={shelter.id}
                  position={[shelter.latitude, shelter.longitude]}
                  icon={getIcon(shelter)}
                  eventHandlers={{
                    click: () => setSelectedShelter(shelter),
                  }}
                >
                  <Popup>
                    <div className="max-w-xs">
                      <h3 className="font-bold text-lg mb-2">{shelter.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1" />
                          {shelter.address}
                        </div>
                        <div className="flex items-center">
                          <Users size={14} className="mr-1" />
                          収容人数: {shelter.capacity}人
                        </div>
                        <div className={`flex items-center ${getSeverityColor(shelter.evacuationArea)}`}>
                          <span className="font-medium">対象災害: {shelter.evacuationArea}</span>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded ${
                          shelter.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {shelter.isOpen ? '開設中' : '閉鎖中'}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>

        {/* Bottom Panel */}
        <div className="bg-white border-t border-gray-200 p-4 max-h-48 overflow-y-auto">
          <h2 className="font-bold text-lg mb-3 flex items-center">
            <Navigation className="mr-2" size={20} />
            最寄りの避難所
          </h2>
          
          <div className="space-y-3">
            {nearestShelters.map((shelter) => (
              <div
                key={shelter.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedShelter?.id === shelter.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedShelter(shelter)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{shelter.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{shelter.address}</p>
                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                      <span>📍 {shelter.distance.toFixed(1)}km</span>
                      <span>👥 {shelter.capacity}人</span>
                      <span className={shelter.isOpen ? 'text-green-600' : 'text-red-600'}>
                        {shelter.isOpen ? '開設中' : '閉鎖中'}
                      </span>
                    </div>
                  </div>
                  {shelter.phoneNumber && (
                    <a 
                      href={`tel:${shelter.phoneNumber}`}
                      className="text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}