import { useState, useEffect } from "react";
import type { Route } from "./+types/ai-guide";
import Layout from "../components/Layout";
import { getCurrentPosition, type Coordinates } from "../services/geolocation";
import { getWeatherData, type WeatherData } from "../services/weather";
import { getAIEvacuationGuide, generateEvacuationChecklist, type AIGuideRequest, type AIGuideResponse } from "../services/ai";
import { Shield, AlertTriangle, CheckCircle, Clock, Users, MapPin, Phone } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AIガイド - SafeBridge" },
    { name: "description", content: "AIによる災害時避難ガイドとアドバイス" },
  ];
}

const disasterTypes = [
  { value: "地震", label: "地震", icon: "🏠", color: "bg-red-600" },
  { value: "洪水", label: "洪水・大雨", icon: "🌊", color: "bg-blue-600" },
  { value: "台風", label: "台風・強風", icon: "🌀", color: "bg-purple-600" },
  { value: "火災", label: "火災", icon: "🔥", color: "bg-orange-600" },
  { value: "土砂災害", label: "土砂災害", icon: "⛰️", color: "bg-yellow-600" },
  { value: "その他", label: "その他", icon: "⚠️", color: "bg-gray-600" },
];

export default function AIGuidePage() {
  const [selectedDisaster, setSelectedDisaster] = useState<string>("");
  const [familySize, setFamilySize] = useState<number>(1);
  const [hasDisabilities, setHasDisabilities] = useState<boolean>(false);
  const [hasPets, setHasPets] = useState<boolean>(false);
  const [customSituation, setCustomSituation] = useState<string>("");
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [aiResponse, setAiResponse] = useState<AIGuideResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<string[]>([]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const coordinates = await getCurrentPosition();
        setLocation(coordinates);
        
        const weatherData = await getWeatherData(coordinates);
        setWeather(weatherData);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  const getDangerLevelColor = (level: string) => {
    switch (level) {
      case 'extreme': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'moderate': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDangerLevelText = (level: string) => {
    switch (level) {
      case 'extreme': return '極めて危険';
      case 'high': return '危険';
      case 'moderate': return '注意';
      case 'low': return '軽微';
      default: return '不明';
    }
  };

  const handleGetGuide = async () => {
    if (!selectedDisaster && !customSituation) {
      alert("災害の種類を選択するか、状況を入力してください。");
      return;
    }

    setLoading(true);
    try {
      const request: AIGuideRequest = {
        situation: customSituation || selectedDisaster,
        location,
        weather,
        familySize,
        hasDisabilities,
        hasPets,
      };

      const response = await getAIEvacuationGuide(request);
      setAiResponse(response);
      
      const checklistItems = generateEvacuationChecklist(selectedDisaster || "その他");
      setChecklist(checklistItems);
    } catch (error) {
      console.error('Error getting AI guide:', error);
      alert("AIガイドの取得に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 pb-24">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield size={48} className="text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">AIガイド</h1>
          <p className="text-gray-600">状況に応じた避難アドバイスを取得</p>
        </div>

        {/* Disaster Type Selection */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">災害の種類</h2>
          <div className="grid grid-cols-2 gap-3">
            {disasterTypes.map((disaster) => (
              <button
                key={disaster.value}
                onClick={() => setSelectedDisaster(disaster.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedDisaster === disaster.value
                    ? `${disaster.color} text-white border-transparent`
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{disaster.icon}</div>
                <div className="text-sm font-medium">{disaster.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Situation */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4">具体的な状況（任意）</h2>
          <textarea
            value={customSituation}
            onChange={(e) => setCustomSituation(e.target.value)}
            placeholder="現在の状況を詳しく入力してください..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24"
          />
        </div>

        {/* Family Information */}
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
          <h2 className="text-lg font-bold text-gray-800">家族情報</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              家族の人数
            </label>
            <select
              value={familySize}
              onChange={(e) => setFamilySize(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <option key={num} value={num}>{num}人</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasDisabilities}
                onChange={(e) => setHasDisabilities(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">要援護者がいる</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasPets}
                onChange={(e) => setHasPets(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">ペットがいる</span>
            </label>
          </div>
        </div>

        {/* Get Guide Button */}
        <button
          onClick={handleGetGuide}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
              <span>分析中...</span>
            </div>
          ) : (
            "AIガイドを取得"
          )}
        </button>

        {/* AI Response */}
        {aiResponse && (
          <div className="space-y-4">
            {/* Danger Level */}
            <div className={`p-4 rounded-lg ${getDangerLevelColor(aiResponse.estimatedDangerLevel)}`}>
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle size={20} />
                <span className="font-bold">危険度レベル</span>
              </div>
              <div className="text-xl font-bold">
                {getDangerLevelText(aiResponse.estimatedDangerLevel)}
              </div>
            </div>

            {/* Immediate Actions */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-bold text-red-800 mb-3 flex items-center">
                <Clock className="mr-2" size={20} />
                直ちに行うべきこと
              </h3>
              <ul className="space-y-2">
                {aiResponse.immediateActions.map((action, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-700">
                    <span className="text-red-500 font-bold mt-1">{index + 1}.</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Evacuation Plan */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center">
                <MapPin className="mr-2" size={20} />
                避難計画
              </h3>
              <p className="text-blue-700">{aiResponse.evacuationPlan}</p>
            </div>

            {/* Safety Tips */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                <Shield className="mr-2" size={20} />
                安全のためのポイント
              </h3>
              <ul className="space-y-2">
                {aiResponse.safetyTips.map((tip, index) => (
                  <li key={index} className="flex items-start space-x-2 text-yellow-700">
                    <CheckCircle className="text-yellow-500 mt-1" size={16} />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                <Phone className="mr-2" size={20} />
                緊急連絡先
              </h3>
              <ul className="space-y-2">
                {aiResponse.emergencyContacts.map((contact, index) => (
                  <li key={index} className="text-gray-700 font-medium">
                    {contact}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Evacuation Checklist */}
        {checklist.length > 0 && (
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <h3 className="font-bold text-green-800 mb-3 flex items-center">
              <CheckCircle className="mr-2" size={20} />
              避難チェックリスト
            </h3>
            <ul className="space-y-2">
              {checklist.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-green-600"
                    id={`checklist-${index}`}
                  />
                  <label
                    htmlFor={`checklist-${index}`}
                    className="text-green-700 text-sm"
                  >
                    {item}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-gray-800 mb-3">関連アクション</h3>
          <div className="space-y-2">
            <a
              href="/map"
              className="block w-full bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700"
            >
              <MapPin className="inline mr-2" size={16} />
              避難所マップを確認
            </a>
            <a
              href="/chat"
              className="block w-full bg-orange-600 text-white text-center py-2 rounded-lg hover:bg-orange-700"
            >
              <Users className="inline mr-2" size={16} />
              AIに詳しく相談
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}