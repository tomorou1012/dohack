import { useState, useEffect } from "react";
import type { Route } from "./+types/settings";
import Layout from "../components/Layout";
import { Settings, User, Bell, MapPin, Shield, Smartphone, Download, Trash2 } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "設定 - SafeBridge" },
    { name: "description", content: "アプリの設定とユーザー設定" },
  ];
}

interface UserSettings {
  name: string;
  familySize: number;
  hasDisabilities: boolean;
  hasPets: boolean;
  emergencyContact: string;
  preferredEvacuationSite: string;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    familySize: 1,
    hasDisabilities: false,
    hasPets: false,
    emergencyContact: "",
    preferredEvacuationSite: "",
    notificationsEnabled: true,
    locationEnabled: true,
  });
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('safebridge-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Check if PWA is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsPWAInstalled(true);
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('safebridge-settings', JSON.stringify(newSettings));
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPWAInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const clearCache = () => {
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    localStorage.clear();
    sessionStorage.clear();
    alert('キャッシュとデータを削除しました。アプリを再読み込みしてください。');
  };

  const requestLocationPermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted') {
        saveSettings({ ...settings, locationEnabled: true });
      } else {
        navigator.geolocation.getCurrentPosition(
          () => {
            saveSettings({ ...settings, locationEnabled: true });
            alert('位置情報の許可が完了しました。');
          },
          () => {
            alert('位置情報の許可が拒否されました。ブラウザの設定から許可してください。');
          }
        );
      }
    } catch (error) {
      alert('位置情報の許可に失敗しました。');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        saveSettings({ ...settings, notificationsEnabled: true });
        alert('通知の許可が完了しました。');
      } else {
        alert('通知の許可が拒否されました。');
      }
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Settings size={48} className="text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">設定</h1>
          <p className="text-gray-600">アプリの設定とプロフィール</p>
        </div>

        {/* User Profile */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <User className="mr-2" size={20} />
            ユーザープロフィール
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => saveSettings({ ...settings, name: e.target.value })}
                placeholder="山田太郎"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                家族の人数
              </label>
              <select
                value={settings.familySize}
                onChange={(e) => saveSettings({ ...settings, familySize: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num}人</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                緊急連絡先
              </label>
              <input
                type="tel"
                value={settings.emergencyContact}
                onChange={(e) => saveSettings({ ...settings, emergencyContact: e.target.value })}
                placeholder="090-1234-5678"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.hasDisabilities}
                  onChange={(e) => saveSettings({ ...settings, hasDisabilities: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">要援護者がいる</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.hasPets}
                  onChange={(e) => saveSettings({ ...settings, hasPets: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">ペットがいる</span>
              </label>
            </div>
          </div>
        </div>

        {/* App Permissions */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <Shield className="mr-2" size={20} />
            アプリの許可設定
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-green-600" />
                <div>
                  <div className="font-medium text-gray-800">位置情報</div>
                  <div className="text-sm text-gray-600">避難所検索に必要</div>
                </div>
              </div>
              <button
                onClick={requestLocationPermission}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.locationEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.locationEnabled ? '許可済み' : '許可する'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell size={20} className="text-orange-600" />
                <div>
                  <div className="font-medium text-gray-800">プッシュ通知</div>
                  <div className="text-sm text-gray-600">緊急警報の受信</div>
                </div>
              </div>
              <button
                onClick={requestNotificationPermission}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  settings.notificationsEnabled
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {settings.notificationsEnabled ? '許可済み' : '許可する'}
              </button>
            </div>
          </div>
        </div>

        {/* PWA Installation */}
        {!isPWAInstalled && deferredPrompt && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h2 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
              <Smartphone className="mr-2" size={20} />
              アプリのインストール
            </h2>
            <p className="text-blue-700 mb-4 text-sm">
              SafeBridgeをホーム画面に追加して、より簡単にアクセスできます。オフラインでも一部機能が利用可能になります。
            </p>
            <button
              onClick={handleInstallPWA}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            >
              <Download size={20} />
              <span>アプリをインストール</span>
            </button>
          </div>
        )}

        {/* Data Management */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">データ管理</h2>
          
          <div className="space-y-4">
            <button
              onClick={clearCache}
              className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
            >
              <Trash2 size={20} />
              <span>キャッシュとデータを削除</span>
            </button>
            <p className="text-xs text-gray-500">
              アプリのキャッシュと保存されたデータを削除します。設定もリセットされます。
            </p>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">アプリ情報</h2>
          <div className="text-sm text-gray-600 space-y-2">
            <div>バージョン: 1.0.0</div>
            <div>更新日: 2024年1月</div>
            <div>開発者: SafeBridge Team</div>
          </div>
        </div>

        {/* Emergency Numbers */}
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <h2 className="text-lg font-bold text-red-800 mb-4">緊急連絡先</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>消防・救急</span>
              <a href="tel:119" className="text-red-600 font-bold">119</a>
            </div>
            <div className="flex justify-between">
              <span>警察</span>
              <a href="tel:110" className="text-red-600 font-bold">110</a>
            </div>
            <div className="flex justify-between">
              <span>災害用伝言ダイヤル</span>
              <a href="tel:171" className="text-red-600 font-bold">171</a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}