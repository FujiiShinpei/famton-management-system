export type OrderStatus = "未対応" | "製造中" | "発送済" | "キャンセル";

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  email: string;
  product_id: string;
  quantity: number;
  amount: number;
  status: OrderStatus;
  is_paid_to_worker: boolean;
  // New Fields
  delivery_method: "配送" | "その他";
  postal_code?: string;
  address?: string;
  phone_number?: string;
  team_name?: string;
  remarks?: string;
  payment_status: "未入金" | "入金済";
  advanced_shipping_cost?: number;
  prefecture?: string;
  shipping_cost?: number;
  // 領収書
  receipt_required?: boolean;
  receipt_name?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  labor_cost: number;
  is_active: boolean;
  factory_only: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  is_advance?: boolean;
  is_advance_paid?: boolean;
}
