import nodemailer from 'nodemailer';
import { Order, Product } from './types';

// SMTP config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SMTP_USER;

function formatPrice(price: number) {
  return `¥${price.toLocaleString()}`;
}

export async function sendOrderConfirmationEmail(order: Order, product: Product) {
  if (!order.email) {
    console.log(`[Order Confirmation] Email not sent: No email address for order ${order.id}`);
    return;
  }

  const shippingCost = Number(order.shipping_cost) || 0;
  const productAmount = Number(order.amount) || 0;
  const totalAmount = productAmount + shippingCost;

  const mailOptions = {
    from: FROM_EMAIL,
    to: order.email,
    subject: '【Famton】ご注文ありがとうございます',
    text: `
${order.customer_name} 様

この度はご注文いただき、誠にありがとうございます。
以下の内容で注文を受け付けました。

【ご注文内容】
・商品名: ${product.name}
・数量: ${order.quantity}
・商品代金: ${formatPrice(productAmount)}
${order.delivery_method === '配送' ? `・送料: ${formatPrice(shippingCost)}\n` : ''}・お支払い合計: ${formatPrice(totalAmount)}
・受取方法: ${order.delivery_method}
${order.delivery_method === '配送' ? `・お届け先: 〒${order.postal_code}\n${order.address}` : ''}

【お振込先】
こちらへお振込みをお願いいたします
銀行名: 三ツ住友銀行
支店名: 西宮支店 (370)
口座種別: 普通
口座番号: 8970299
口座名義: ﾌｼﾞｲｼﾞﾑｼｮ ﾌｼﾞｲｼﾝﾍﾟｲ

入金確認後、または発送準備が整い次第、改めてご連絡いたします。
引き続きよろしくお願いいたします。
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
}

export async function sendPaymentConfirmationEmail(order: Order, product: Product) {
  if (!order.email) {
    console.log(`[Payment Confirmation] Email not sent: No email address for order ${order.id}`);
    return;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://famton-online.com').replace(/\/$/, '');
  const receiptUrl = `${baseUrl}/receipt/${order.id}`;

  const receiptSection = order.receipt_required
    ? `
【領収書のご案内】
ご希望いただいた領収書は、以下のURLから発行（ダウンロード）いただけます。
宛名: ${order.receipt_name || order.customer_name} 様
${receiptUrl}

※ページを開き「PDFとして保存／印刷する」ボタンからPDFを保存できます。
`
    : '';

  const mailOptions = {
    from: FROM_EMAIL,
    to: order.email,
    subject: '【Famton】ご入金を確認いたしました',
    text: `
${order.customer_name} 様

Famtonです。
ご注文いただいた商品（${product.name}）の代金のご入金を確認いたしました。

現在、発送（お渡し）の準備を進めております。
準備が完了次第、改めてご連絡いたします。
${receiptSection}
引き続きよろしくお願いいたします。
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
}

export async function sendShippingCompletionEmail(order: Order, product: Product) {
  if (!order.email) {
    console.log(`[Shipping Completion] Email not sent: No email address for order ${order.id}`);
    return;
  }

  const mailOptions = {
    from: FROM_EMAIL,
    to: order.email,
    subject: '【Famton】商品の発送（お渡し準備）が完了しました',
    text: `
${order.customer_name} 様

Famtonです。
ご注文いただいた商品の発送（またはお渡しの準備）が完了いたしました。

【ご注文内容】
・商品名: ${product.name}
・数量: ${order.quantity}
・受取方法: ${order.delivery_method}

${order.delivery_method === '配送' ? '商品は近日中にお届け予定です。到着まで今しばらくお待ちください。' : '商品の準備が整いました。手渡し等でお受け取りをお願いいたします。'}

この度はご利用ありがとうございました。
またのご利用をお待ちしております。
    `.trim(),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending shipping completion email:', error);
  }
}
