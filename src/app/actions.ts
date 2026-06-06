'use server'

import { googleSheetsService } from '@/lib/google-sheets'
import { Order, OrderStatus, Product, Expense } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { sendLineMessage } from '@/lib/line'
import { sendOrderConfirmationEmail, sendPaymentConfirmationEmail, sendShippingCompletionEmail } from '@/lib/email'

export async function getProducts(): Promise<Product[]> {
    return await googleSheetsService.getProducts()
}

export async function submitOrder(data: {
    customer_name: string;
    email: string;
    product_id: string;
    quantity: number;
    delivery_method: "配送" | "その他";
    postal_code?: string;
    prefecture?: string;
    address?: string;
    phone_number?: string;
    team_name?: string;
    remarks?: string;
    shipping_cost?: number;
    receipt_required?: boolean;
    receipt_name?: string;
}) {
    const products = await googleSheetsService.getProducts()
    const product = products.find(p => p.id === data.product_id)

    if (!product) {
        throw new Error('Product not found')
    }

    const amount = product.price * data.quantity

    await googleSheetsService.addOrder({
        customer_name: data.customer_name,
        email: data.email,
        product_id: data.product_id,
        quantity: data.quantity,
        amount: amount,
        delivery_method: data.delivery_method,
        postal_code: data.postal_code,
        prefecture: data.prefecture,
        address: data.address,
        phone_number: data.phone_number,
        team_name: data.team_name,
        remarks: data.remarks,
        shipping_cost: data.shipping_cost,
        receipt_required: data.receipt_required,
        receipt_name: data.receipt_name,
    })

    // Send LINE Notification (Fire and forget, don't block response)
    const message = `
🔔 新しい注文が入りました！

👤 顧客名: ${data.customer_name}
✉️ メール: ${data.email}
🏸 商品: ${product.name}
📦 数量: ${data.quantity}
💰 金額: ¥${amount.toLocaleString()}
🚚 受取: ${data.delivery_method}
${data.team_name ? `🏢 チーム: ${data.team_name}` : ''}
${data.remarks ? `📝 備考: ${data.remarks}` : ''}
${data.receipt_required ? `🧾 領収書: 希望あり（宛名: ${data.receipt_name || '未指定'}）` : ''}
    `.trim();

    // Use setImmediate or just call generic promise without await if we don't want to wait
    // But Vercel functions might kill it. Safest is to await or accept tiny latency.
    // Given the simplicity, awaiting is fine as LINE API is fast.
    await sendLineMessage(message);

    const tempOrder: Order = {
        id: '',
        created_at: new Date().toISOString(),
        customer_name: data.customer_name,
        email: data.email,
        product_id: data.product_id,
        quantity: data.quantity,
        amount: amount,
        status: '未対応',
        is_paid_to_worker: false,
        payment_status: '未入金',
        delivery_method: data.delivery_method,
        postal_code: data.postal_code,
        address: data.address,
        phone_number: data.phone_number,
        team_name: data.team_name,
        remarks: data.remarks,
        prefecture: data.prefecture,
        shipping_cost: data.shipping_cost,
        receipt_required: data.receipt_required,
        receipt_name: data.receipt_name,
    };
    sendOrderConfirmationEmail(tempOrder, product).catch(console.error);

    revalidatePath('/factory', 'layout')
    revalidatePath('/admin')
}

export async function submitProxyOrder(data: {
    customer_name: string;
    email: string;
    product_id: string;
    quantity: number;
    delivery_method: "配送" | "その他";
    postal_code?: string;
    prefecture?: string;
    address?: string;
    phone_number?: string;
    team_name?: string;
    remarks?: string;
    shipping_cost?: number;
    receipt_required?: boolean;
    receipt_name?: string;
}) {
    const products = await googleSheetsService.getProducts()
    const product = products.find(p => p.id === data.product_id)

    if (!product) {
        throw new Error('Product not found')
    }

    const amount = product.price * data.quantity

    await googleSheetsService.addOrder({
        customer_name: data.customer_name,
        email: data.email,
        product_id: data.product_id,
        quantity: data.quantity,
        amount: amount,
        delivery_method: data.delivery_method,
        postal_code: data.postal_code,
        prefecture: data.prefecture,
        address: data.address,
        phone_number: data.phone_number,
        team_name: data.team_name,
        remarks: data.remarks,
        shipping_cost: data.shipping_cost,
        receipt_required: data.receipt_required,
        receipt_name: data.receipt_name,
    })

    // Send LINE Notification (Fire and forget, don't block response)
    const message = `
🔔 【代理入力】新しい注文が入りました！

👤 顧客名: ${data.customer_name}
✉️ メール: ${data.email}
🏸 商品: ${product.name}
📦 数量: ${data.quantity}
💰 金額: ¥${amount.toLocaleString()}
🚚 受取: ${data.delivery_method}
${data.team_name ? `🏢 チーム: ${data.team_name}` : ''}
${data.remarks ? `📝 備考: ${data.remarks}` : ''}
${data.receipt_required ? `🧾 領収書: 希望あり（宛名: ${data.receipt_name || '未指定'}）` : ''}
    `.trim();

    await sendLineMessage(message);

    // Skip order confirmation email as per user request.

    revalidatePath('/factory', 'layout')
    revalidatePath('/admin')
}

export async function getOrders() {
    return await googleSheetsService.getOrders()
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
    await googleSheetsService.updateOrderStatus(id, status)
    
    if (status === '発送済') {
        const orders = await googleSheetsService.getOrders();
        const order = orders.find(o => o.id === id);
        const products = await googleSheetsService.getProducts();
        if (order) {
            const product = products.find(p => p.id === order.product_id);
            if (product) {
                sendShippingCompletionEmail(order, product).catch(console.error);
            }
        }
    }

    revalidatePath('/factory', 'layout')
    revalidatePath('/admin')
}

export async function completeShipping(id: string, advancedShippingCost: number) {
    await googleSheetsService.updateOrder(id, {
        status: '発送済',
        advanced_shipping_cost: advancedShippingCost
    })
    
    const orders = await googleSheetsService.getOrders();
    const order = orders.find(o => o.id === id);
    const products = await googleSheetsService.getProducts();
    if (order) {
        const product = products.find(p => p.id === order.product_id);
        if (product) {
            sendShippingCompletionEmail(order, product).catch(console.error);
        }
    }

    revalidatePath('/factory', 'layout')
    revalidatePath('/admin')
}

export async function updatePaymentStatus(id: string, status: "未入金" | "入金済") {
    await googleSheetsService.updateOrder(id, { payment_status: status })
    
    if (status === '入金済') {
        const orders = await googleSheetsService.getOrders();
        const order = orders.find(o => o.id === id);
        const products = await googleSheetsService.getProducts();
        if (order) {
            const product = products.find(p => p.id === order.product_id);
            if (product) {
                sendPaymentConfirmationEmail(order, product).catch(console.error);
            }
        }
    }

    revalidatePath('/factory', 'layout')
    revalidatePath('/admin')
}

export async function getExpenses() {
    return await googleSheetsService.getExpenses()
}

export async function payWorkers(
    orderIds: string[],
    expenseIds: string[],
    laborTotal: number,
    shippingAdvanceTotal: number,
) {
    await googleSheetsService.markOrdersAsPaid(orderIds);
    await googleSheetsService.markAdvancesAsPaid(expenseIds);

    // 工賃（給料）を登録
    if (laborTotal > 0) {
        await googleSheetsService.addExpense({
            date: new Date().toISOString(),
            category: '給料',
            amount: laborTotal,
            description: `製造費 ${orderIds.length}件分`,
            is_advance: false,
            is_advance_paid: false,
        });
    }

    // 建て替え送料（荷造運賃）を別途登録
    if (shippingAdvanceTotal > 0) {
        await googleSheetsService.addExpense({
            date: new Date().toISOString(),
            category: '荷造運賃',
            amount: shippingAdvanceTotal,
            description: `発送時建て替え送料 ${orderIds.length}件分`,
            is_advance: false,
            is_advance_paid: false,
        });
    }

    revalidatePath('/admin');
    revalidatePath('/factory', 'layout');
}

export async function addAdvanceExpense(data: { date: string; category: string; amount: number; description: string }) {
    await googleSheetsService.addExpense({
        ...data,
        is_advance: true,
        is_advance_paid: false,
    });
    revalidatePath('/admin');
    revalidatePath('/factory', 'layout');
    revalidatePath('/expenses');
}

export async function deleteOrder(id: string) {
    await googleSheetsService.deleteOrder(id);
    revalidatePath('/factory', 'layout');
    revalidatePath('/admin');
}


export async function updateOrder(id: string, data: Partial<Order>) {
    await googleSheetsService.updateOrder(id, data);
    revalidatePath('/factory', 'layout');
    revalidatePath('/admin');
}

export async function addExpense(data: Omit<Expense, 'id'>) {
    await googleSheetsService.addExpense(data);
    revalidatePath('/admin');
    revalidatePath('/expenses');
}
