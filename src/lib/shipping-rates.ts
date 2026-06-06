// 都道府県一覧
export const PREFECTURES = [
    '北海道',
    '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県',
    '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
    '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県',
    '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
    '沖縄県',
];

// ゾーン定義
type Zone = 'kinki' | 'chubu_chugoku' | 'kanto' | 'tohoku_hokuriku' | 'hokkaido' | 'kyushu' | 'okinawa';

const PREFECTURE_ZONE_MAP: Record<string, Zone> = {
    '大阪府': 'kinki',
    '兵庫県': 'kinki',
    '京都府': 'kinki',
    '滋賀県': 'kinki',
    '奈良県': 'kinki',
    '和歌山県': 'kinki',

    '愛知県': 'chubu_chugoku',
    '岐阜県': 'chubu_chugoku',
    '三重県': 'chubu_chugoku',
    '静岡県': 'chubu_chugoku',
    '山梨県': 'chubu_chugoku',
    '長野県': 'chubu_chugoku',
    '岡山県': 'chubu_chugoku',
    '広島県': 'chubu_chugoku',
    '山口県': 'chubu_chugoku',
    '鳥取県': 'chubu_chugoku',
    '島根県': 'chubu_chugoku',
    '徳島県': 'chubu_chugoku',
    '香川県': 'chubu_chugoku',
    '愛媛県': 'chubu_chugoku',
    '高知県': 'chubu_chugoku',

    '東京都': 'kanto',
    '神奈川県': 'kanto',
    '埼玉県': 'kanto',
    '千葉県': 'kanto',
    '茨城県': 'kanto',
    '栃木県': 'kanto',
    '群馬県': 'kanto',

    '新潟県': 'tohoku_hokuriku',
    '富山県': 'tohoku_hokuriku',
    '石川県': 'tohoku_hokuriku',
    '福井県': 'tohoku_hokuriku',
    '宮城県': 'tohoku_hokuriku',
    '福島県': 'tohoku_hokuriku',
    '山形県': 'tohoku_hokuriku',
    '秋田県': 'tohoku_hokuriku',
    '岩手県': 'tohoku_hokuriku',
    '青森県': 'tohoku_hokuriku',

    '北海道': 'hokkaido',

    '福岡県': 'kyushu',
    '佐賀県': 'kyushu',
    '長崎県': 'kyushu',
    '熊本県': 'kyushu',
    '大分県': 'kyushu',
    '宮崎県': 'kyushu',
    '鹿児島県': 'kyushu',

    '沖縄県': 'okinawa',
};

// ダース数区分を取得
type SizeGroup = 'small' | 'medium' | 'large';
function getSizeGroup(quantity: number): SizeGroup {
    if (quantity <= 1) return 'small';   // 1ダース
    if (quantity <= 3) return 'medium';  // 2~3ダース
    return 'large';                       // 4ダース以上
}

// ゾーン × サイズ 送料テーブル (円)
const SHIPPING_RATE_TABLE: Record<Zone, Record<SizeGroup, number>> = {
    kinki:            { small: 600,  medium: 800, large: 1000 },
    chubu_chugoku:    { small: 600,  medium: 800, large: 1000 },
    kanto:            { small: 650,  medium: 850, large: 1100 },
    tohoku_hokuriku:  { small: 800, medium: 1000, large: 1300 },
    hokkaido:         { small: 1200, medium: 1400, large: 1700 },
    kyushu:           { small: 700,  medium: 850, large: 1100 },
    okinawa:          { small: 1900, medium: 2600, large: 3200 },
};

/**
 * 都道府県と数量（ダース数）から送料を計算する
 * @param prefecture 都道府県名（例: '大阪府'）
 * @param quantity ダース数
 * @returns 送料（円）。都道府県が未選択や不明の場合は 0
 */
export function calculateShippingCost(prefecture: string, quantity: number): number {
    if (!prefecture) return 0;
    const zone = PREFECTURE_ZONE_MAP[prefecture];
    if (!zone) return 0;
    const sizeGroup = getSizeGroup(quantity);
    return SHIPPING_RATE_TABLE[zone][sizeGroup];
}

export type { Zone, SizeGroup };
