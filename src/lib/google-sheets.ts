import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Order, Product, Expense, OrderStatus } from './types';

// Environment variables
const SPEADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

// Mock Data
const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', name: 'Premium Shuttle', price: 3500, labor_cost: 500, is_active: true, factory_only: false },
    { id: 'p2', name: 'Training Shuttle', price: 2500, labor_cost: 300, is_active: true, factory_only: false },
    { id: 'p3', name: 'Racket Grip', price: 500, labor_cost: 50, is_active: true, factory_only: false },
    { id: 'p4', name: 'Factory Only Shuttle', price: 2000, labor_cost: 250, is_active: true, factory_only: true },
];

// globalThis を使うことで、Server Action と Server Component が
// 別モジュールコンテキストで評価される場合でもデータを共有できる
declare global {
    var __famton_mock_orders: Order[] | undefined;
    var __famton_mock_expenses: Expense[] | undefined;
}

if (!global.__famton_mock_orders) {
    global.__famton_mock_orders = [
        {
            id: 'o1',
            created_at: new Date().toISOString(),
            customer_name: '山田 太郎',
            email: 'dummy1@example.com',
            product_id: 'p1',
            quantity: 2,
            amount: 7000,
            status: '未対応',
            is_paid_to_worker: false,
            delivery_method: 'その他',
            payment_status: '未入金',
        },
        {
            id: 'o2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            customer_name: '佐藤 花子',
            email: 'dummy2@example.com',
            product_id: 'p2',
            quantity: 5,
            amount: 12500,
            status: '発送済',
            is_paid_to_worker: false,
            delivery_method: '配送',
            postal_code: '123-4567',
            address: '東京都渋谷区...',
            phone_number: '090-1234-5678',
            payment_status: '未入金',
        },
        {
            id: 'o3',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            customer_name: '鈴木 一郎',
            email: 'dummy3@example.com',
            product_id: 'p1',
            quantity: 10,
            amount: 35000,
            status: '発送済',
            is_paid_to_worker: true,
            delivery_method: 'その他',
            payment_status: '入金済',
        },
    ];
}

if (!global.__famton_mock_expenses) {
    global.__famton_mock_expenses = [
        {
            id: 'e1',
            date: new Date(Date.now() - 172800000).toISOString(),
            category: '給料',
            amount: 5000,
            description: '鈴木 一郎様分など',
        },
    ];
}

const getMockOrders = () => global.__famton_mock_orders!;
const getMockExpenses = () => global.__famton_mock_expenses!;

export class GoogleSheetsService {
    private doc: GoogleSpreadsheet | null = null;
    private isMock: boolean = false;

    constructor() {
        if (!SPEADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
            console.warn("⚠️  Missing Google Sheets credentials. Using Mock Service.");
            console.log("Credentials Status:", {
                SheetID: !!SPEADSHEET_ID,
                Email: !!GOOGLE_CLIENT_EMAIL,
                Key: !!GOOGLE_PRIVATE_KEY
            });
            this.isMock = true;
        } else {
            console.log("✅ Credentials found. Attempting to connect to Google Sheets...");
            try {
                // Clean the key: handle both literal \n (from some copy-pastes) and escaped \\n
                const cleanKey = GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

                const auth = new JWT({
                    email: GOOGLE_CLIENT_EMAIL,
                    key: cleanKey,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
                this.doc = new GoogleSpreadsheet(SPEADSHEET_ID, auth);
                this.isMock = false;
            } catch (error) {
                console.error("❌ Error initializing Google Sheets auth:", error);
                this.isMock = true;
            }
        }
    }

    private async ensureOrderHeaders(sheet: any) {
        await sheet.loadHeaderRow();
        const requiredHeaders = [
            'id', 'created_at', 'customer_name', 'email', 'product_id', 
            'quantity', 'amount', 'status', 'is_paid_to_worker', 
            'delivery_method', 'postal_code', 'address', 'phone_number', 
            'team_name', 'remarks', 'payment_status', 'advanced_shipping_cost',
            'prefecture', 'shipping_cost', 'receipt_required', 'receipt_name'
        ];
        const currentHeaders = sheet.headerValues || [];
        let updated = false;
        let newHeaders = [...currentHeaders];
        for (const header of requiredHeaders) {
            if (!newHeaders.includes(header)) {
                newHeaders.push(header);
                updated = true;
            }
        }
        if (updated) {
            await sheet.setHeaderRow(newHeaders);
        }
    }

    async getProducts(): Promise<Product[]> {
        if (this.isMock) return MOCK_PRODUCTS;
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['products'];
        if (!sheet) throw new Error("Sheet 'products' not found");
        const rows = await sheet.getRows();
        return rows.map(row => ({
            id: row.get('id'),
            name: row.get('name'),
            price: Number(row.get('price')),
            labor_cost: Number(row.get('labor_cost')),
            is_active: row.get('is_active') === 'TRUE',
            factory_only: row.get('factory_only') === 'TRUE',
        }));
    }

    async getOrders(): Promise<Order[]> {
        if (this.isMock) return getMockOrders();
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];
        if (!sheet) throw new Error("Sheet 'orders' not found");
        
        await this.ensureOrderHeaders(sheet);
        
        const rows = await sheet.getRows(); // Simplified for speed
        return rows.map(row => ({
            id: row.get('id'),
            created_at: row.get('created_at'),
            customer_name: row.get('customer_name'),
            email: row.get('email') || '',
            product_id: row.get('product_id'), // Assuming columns exist
            quantity: Number(row.get('quantity')),
            amount: Number(row.get('amount')),
            status: row.get('status') as OrderStatus,
            is_paid_to_worker: row.get('is_paid_to_worker') === 'TRUE',
            delivery_method: row.get('delivery_method') as "配送" | "その他" || "その他",
            postal_code: row.get('postal_code'),
            address: row.get('address'),
            phone_number: row.get('phone_number'),
            team_name: row.get('team_name'),
            remarks: row.get('remarks'),
            payment_status: row.get('payment_status') as "未入金" | "入金済" || '未入金',
            advanced_shipping_cost: row.get('advanced_shipping_cost') ? Number(row.get('advanced_shipping_cost')) : undefined,
            prefecture: row.get('prefecture') || undefined,
            shipping_cost: row.get('shipping_cost') ? Number(row.get('shipping_cost')) : undefined,
            receipt_required: row.get('receipt_required') === 'TRUE',
            receipt_name: row.get('receipt_name') || undefined,
        }));
    }

    async addOrder(order: Omit<Order, 'id' | 'created_at' | 'status' | 'is_paid_to_worker' | 'payment_status'>): Promise<void> {
        const newOrder: Order = {
            ...order,
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            status: '未対応',
            is_paid_to_worker: false,
            payment_status: '未入金',
        };

        if (this.isMock) {
            getMockOrders().push(newOrder);
            return;
        }

        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];

        await this.ensureOrderHeaders(sheet);

        await sheet.addRow({
            id: newOrder.id,
            created_at: newOrder.created_at,
            customer_name: newOrder.customer_name,
            email: newOrder.email,
            product_id: newOrder.product_id,
            quantity: newOrder.quantity,
            amount: newOrder.amount,
            status: newOrder.status,
            is_paid_to_worker: 'FALSE',
            delivery_method: newOrder.delivery_method,
            postal_code: newOrder.postal_code || '',
            address: newOrder.address || '',
            phone_number: newOrder.phone_number || '',
            team_name: newOrder.team_name || '',
            remarks: newOrder.remarks || '',
            payment_status: '未入金',
            prefecture: newOrder.prefecture || '',
            shipping_cost: newOrder.shipping_cost || 0,
            receipt_required: newOrder.receipt_required ? 'TRUE' : 'FALSE',
            receipt_name: newOrder.receipt_name || '',
        });
    }

    async updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
        if (this.isMock) {
            const order = getMockOrders().find(o => o.id === id);
            if (order) order.status = status;
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];
        await this.ensureOrderHeaders(sheet);
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            row.set('status', status);
            await row.save();
        }
    }

    async getExpenses(): Promise<Expense[]> {
        if (this.isMock) return getMockExpenses();
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['expenses'];
        const rows = await sheet.getRows();
        return rows.map(row => {
            const amountVal = row.get('amount') || row.get('Amount');
            return {
                id: row.get('id'),
                date: row.get('date'),
                category: row.get('category'),
                amount: Number(amountVal) || 0,
                description: row.get('description'),
                is_advance: row.get('is_advance') === 'TRUE',
                is_advance_paid: row.get('is_advance_paid') === 'TRUE',
            };
        });
    }

    async addExpense(expense: Omit<Expense, 'id'>): Promise<void> {
        if (this.isMock) {
            getMockExpenses().push({ ...expense, id: Math.random().toString(36).substring(7) });
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['expenses'];

        await sheet.loadHeaderRow();
        const requiredHeaders = ['id', 'date', 'category', 'amount', 'description', 'is_advance', 'is_advance_paid'];
        if (sheet.headerValues.length === 0) {
            await sheet.setHeaderRow(requiredHeaders);
        } else {
            const current = sheet.headerValues;
            let updated = false;
            const newHeaders = [...current];
            for (const h of requiredHeaders) {
                if (!newHeaders.includes(h)) { newHeaders.push(h); updated = true; }
            }
            if (updated) await sheet.setHeaderRow(newHeaders);
        }

        await sheet.addRow({
            id: Math.random().toString(36).substring(7),
            date: expense.date,
            category: expense.category,
            amount: expense.amount,
            description: expense.description,
            is_advance: expense.is_advance ? 'TRUE' : 'FALSE',
            is_advance_paid: expense.is_advance_paid ? 'TRUE' : 'FALSE',
        });
    }

    async markAdvancesAsPaid(expenseIds: string[]): Promise<void> {
        if (this.isMock) {
            getMockExpenses().forEach(e => {
                if (expenseIds.includes(e.id)) e.is_advance_paid = true;
            });
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['expenses'];
        const rows = await sheet.getRows();
        for (const row of rows) {
            if (expenseIds.includes(row.get('id'))) {
                row.set('is_advance_paid', 'TRUE');
                await row.save();
            }
        }
    }

    // Payroll Logic: Mark orders as paid
    async markOrdersAsPaid(orderIds: string[]): Promise<void> {
        if (this.isMock) {
            getMockOrders().forEach(o => {
                if (orderIds.includes(o.id)) o.is_paid_to_worker = true;
            });
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];
        await this.ensureOrderHeaders(sheet);
        const rows = await sheet.getRows();
        for (const row of rows) {
            if (orderIds.includes(row.get('id'))) {
                row.set('is_paid_to_worker', 'TRUE');
                await row.save();
            }
        }
    }
    // Factory Logic: Delete Order
    async deleteOrder(id: string): Promise<void> {
        if (this.isMock) {
            global.__famton_mock_orders = getMockOrders().filter(o => o.id !== id);
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];
        await this.ensureOrderHeaders(sheet);
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            await row.delete();
        }
    }

    // Factory Logic: Update Order Details
    async updateOrder(id: string, updates: Partial<Order>): Promise<void> {
        if (this.isMock) {
            const orders = getMockOrders();
            const index = orders.findIndex(o => o.id === id);
            if (index !== -1) {
                orders[index] = { ...orders[index], ...updates };
            }
            return;
        }
        await this.doc!.loadInfo();
        const sheet = this.doc!.sheetsByTitle['orders'];
        await this.ensureOrderHeaders(sheet);
        const rows = await sheet.getRows();
        const row = rows.find(r => r.get('id') === id);
        if (row) {
            if (updates.customer_name) row.set('customer_name', updates.customer_name);
            if (updates.email !== undefined) row.set('email', updates.email);
            if (updates.product_id) row.set('product_id', updates.product_id);
            if (updates.quantity) row.set('quantity', updates.quantity);
            if (updates.amount) row.set('amount', updates.amount);
            if (updates.delivery_method) row.set('delivery_method', updates.delivery_method);
            if (updates.postal_code !== undefined) row.set('postal_code', updates.postal_code);
            if (updates.address !== undefined) row.set('address', updates.address);
            if (updates.phone_number !== undefined) row.set('phone_number', updates.phone_number);
            if (updates.team_name !== undefined) row.set('team_name', updates.team_name);
            if (updates.remarks !== undefined) row.set('remarks', updates.remarks);
            if (updates.status) row.set('status', updates.status);
            if (updates.payment_status) row.set('payment_status', updates.payment_status);
            if (updates.advanced_shipping_cost !== undefined) row.set('advanced_shipping_cost', updates.advanced_shipping_cost);
            if (updates.receipt_required !== undefined) row.set('receipt_required', updates.receipt_required ? 'TRUE' : 'FALSE');
            if (updates.receipt_name !== undefined) row.set('receipt_name', updates.receipt_name);
            await row.save();
        }
    }
}

// Singleton instance
export const googleSheetsService = new GoogleSheetsService();
