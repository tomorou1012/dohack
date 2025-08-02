import { Link, useLocation } from "react-router";
import { MapPin, MessageCircle, Shield, Settings, Home, AlertTriangle } from "lucide-react";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: "ホーム", color: "text-blue-600" },
    { to: "/map", icon: MapPin, label: "避難所マップ", color: "text-green-600" },
    { to: "/ai-guide", icon: Shield, label: "AIガイド", color: "text-purple-600" },
    { to: "/chat", icon: MessageCircle, label: "チャット", color: "text-orange-600" },
    { to: "/settings", icon: Settings, label: "設定", color: "text-gray-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-red-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle size={32} className="text-yellow-300" />
              <div>
                <h1 className="text-2xl font-bold">SafeBridge</h1>
                <p className="text-sm text-red-100">災害時AIガイド＆地域連携</p>
              </div>
            </div>
            <div className="text-sm text-red-100">
              緊急時は <span className="font-bold">119</span> へ
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? `${item.color} bg-gray-100` 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Padding for bottom navigation */}
      <div className="h-20"></div>
    </div>
  );
}