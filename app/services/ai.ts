import { Coordinates } from './geolocation';
import { WeatherData } from './weather';

export interface AIGuideRequest {
  situation: string;
  location?: Coordinates;
  weather?: WeatherData;
  familySize?: number;
  hasDisabilities?: boolean;
  hasPets?: boolean;
}

export interface AIGuideResponse {
  immediateActions: string[];
  evacuationPlan: string;
  safetyTips: string[];
  emergencyContacts: string[];
  estimatedDangerLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mock AI responses - In a real app, this would connect to OpenAI API
export const getAIEvacuationGuide = async (request: AIGuideRequest): Promise<AIGuideResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock response based on situation
  const situation = request.situation.toLowerCase();
  
  let response: AIGuideResponse;
  
  if (situation.includes('地震') || situation.includes('earthquake')) {
    response = {
      immediateActions: [
        "まず身の安全を確保してください（机の下に隠れる、ドアを開ける）",
        "揺れが収まったら火の元を確認・消火",
        "ガスの元栓を閉める",
        "避難経路を確保（ドアや窓を開ける）",
        "家族の安否確認"
      ],
      evacuationPlan: "地震の揺れが収まったら、近くの公園や指定避難所に避難してください。建物の倒壊や落下物に注意し、エレベーターは使わず階段を使用してください。",
      safetyTips: [
        "余震に注意して行動する",
        "ガラスの破片に注意",
        "津波警報が出ている場合は高台へ",
        "デマに惑わされない",
        "ラジオで正確な情報を収集"
      ],
      emergencyContacts: [
        "消防・救急: 119",
        "警察: 110", 
        "災害用伝言ダイヤル: 171"
      ],
      estimatedDangerLevel: 'high'
    };
  } else if (situation.includes('洪水') || situation.includes('台風') || situation.includes('大雨')) {
    response = {
      immediateActions: [
        "気象情報を確認",
        "避難準備・高齢者等避難開始が発令されたら準備開始",
        "避難場所と経路を確認",
        "非常用持ち出し袋を準備",
        "車両の高台移動"
      ],
      evacuationPlan: "浸水の危険がある場合は、早めに高台の避難所へ避難してください。車での避難は危険な場合があるため、状況を判断して徒歩での避難も検討してください。",
      safetyTips: [
        "水深15cmでも歩行困難",
        "マンホールや側溝に注意",
        "冠水道路での運転は避ける",
        "電気設備に近づかない",
        "断水に備えて水を確保"
      ],
      emergencyContacts: [
        "消防・救急: 119",
        "警察: 110",
        "河川情報: 川の防災情報"
      ],
      estimatedDangerLevel: 'moderate'
    };
  } else if (situation.includes('火災') || situation.includes('火事')) {
    response = {
      immediateActions: [
        "「火事だ！」と大声で周囲に知らせる",
        "119番通報",
        "初期消火（可能な範囲で）",
        "すぐに避難",
        "避難後は絶対に戻らない"
      ],
      evacuationPlan: "煙を吸わないよう姿勢を低くして避難してください。エレベーターは使用せず、階段で避難してください。",
      safetyTips: [
        "煙を吸わないよう口と鼻を覆う",
        "扉を開ける前に熱さを確認",
        "炎より煙の方が危険",
        "避難後は絶対に建物に戻らない",
        "集合場所で安否確認"
      ],
      emergencyContacts: [
        "消防・救急: 119",
        "警察: 110"
      ],
      estimatedDangerLevel: 'extreme'
    };
  } else {
    // General disaster response
    response = {
      immediateActions: [
        "冷静になって状況を確認",
        "安全な場所に移動",
        "正確な情報を収集",
        "家族・知人に連絡",
        "必要に応じて避難準備"
      ],
      evacuationPlan: "状況に応じて、最寄りの避難所への避難を検討してください。避難する際は、近所の方にも声をかけてください。",
      safetyTips: [
        "デマ情報に惑わされない",
        "公式情報を確認",
        "助け合いの精神",
        "体調管理に注意",
        "定期的な安否確認"
      ],
      emergencyContacts: [
        "消防・救急: 119",
        "警察: 110",
        "市役所・区役所"
      ],
      estimatedDangerLevel: 'moderate'
    };
  }

  // Adjust based on family situation
  if (request.familySize && request.familySize > 1) {
    response.safetyTips.push("家族全員の安否確認を最優先に");
    response.immediateActions.push("家族の集合場所に向かう");
  }

  if (request.hasDisabilities) {
    response.safetyTips.push("要援護者への配慮と支援");
    response.immediateActions.push("近隣住民への支援要請");
  }

  if (request.hasPets) {
    response.safetyTips.push("ペット同行避難の準備");
    response.immediateActions.push("ペット用避難用品の確認");
  }

  return response;
};

export const sendChatMessage = async (messages: ChatMessage[], newMessage: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock AI chat responses
  const message = newMessage.toLowerCase();
  
  if (message.includes('地震') || message.includes('earthquake')) {
    return "地震が発生している場合、まず身の安全を確保してください。机の下に隠れ、ドアを開けて避難経路を確保してください。揺れが収まったら、火の元を確認し、ガスの元栓を閉めてください。余震に注意しながら、指定された避難所へ向かってください。";
  }
  
  if (message.includes('避難所') || message.includes('避難場所')) {
    return "最寄りの避難所については、「避難所マップ」をご確認ください。現在地から近い順に表示されています。避難所の開設状況も確認できます。夜間の避難は危険が伴うため、明るいうちの避難を心がけてください。";
  }
  
  if (message.includes('準備') || message.includes('持ち物')) {
    return "緊急避難時の持ち物リスト：\n• 飲料水（1人1日3L）\n• 非常食（3日分）\n• 懐中電灯・ラジオ\n• 救急用品・常備薬\n• 現金・通帳・印鑑\n• 身分証明書\n• 着替え・下着\n• タオル・ティッシュ\n• 携帯電話充電器\n\n重要な書類はあらかじめコピーしておきましょう。";
  }
  
  if (message.includes('天気') || message.includes('警報')) {
    return "気象警報については、ホーム画面で最新の情報をご確認ください。特に大雨・強風・雷注意報が発表されている場合は、外出を控え、安全な場所で待機してください。避難情報が発表された場合は、速やかに避難してください。";
  }
  
  if (message.includes('連絡') || message.includes('家族')) {
    return "災害時の家族との連絡方法：\n• 災害用伝言ダイヤル「171」\n• 各携帯会社の災害用伝言板\n• SNSの安否確認機能\n• 事前に決めた集合場所での待ち合わせ\n\n普段から家族で連絡方法と集合場所を決めておきましょう。";
  }
  
  if (message.includes('ペット') || message.includes('動物')) {
    return "ペット同行避難について：\n• ペット用キャリーバッグまたはケージ\n• ペットフード（最低5日分）\n• 薬（処方薬がある場合）\n• ペットの写真（迷子対策）\n• ワクチン接種証明書\n• リードや首輪（迷子札付き）\n\n避難所によってはペット同行ができない場合もあるため、事前に確認しておきましょう。";
  }
  
  // Default response
  return "ご質問ありがとうございます。具体的な災害の種類や状況をお教えいただければ、より詳しいアドバイスをお伝えできます。また、緊急の場合は迷わず119番または110番に連絡してください。あなたの安全が最優先です。";
};

export const generateEvacuationChecklist = (situation: string): string[] => {
  const baseChecklist = [
    "気象情報・災害情報の確認",
    "避難場所と避難経路の確認",
    "家族の安否確認",
    "非常用持ち出し袋の準備",
    "貴重品の確保",
    "ガス・電気・水道の確認",
    "近隣住民への声かけ",
    "ペットの避難準備（該当する場合）"
  ];

  const situationSpecific: { [key: string]: string[] } = {
    '地震': [
      "家具の転倒防止確認",
      "ガラスの飛散防止",
      "余震への警戒"
    ],
    '洪水': [
      "浸水対策（土のう等）",
      "車両の高台移動",
      "電気設備の点検"
    ],
    '台風': [
      "窓ガラスの補強",
      "飛散物の固定・撤去",
      "排水溝の清掃"
    ],
    '火災': [
      "消火器の位置確認",
      "避難経路の障害物除去",
      "緊急連絡先の確認"
    ]
  };

  const specificItems = situationSpecific[situation] || [];
  return [...baseChecklist, ...specificItems];
};