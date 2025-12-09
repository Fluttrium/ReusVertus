import nodemailer from "nodemailer";

export type OrderItemSummary = {
  name: string;
  code: string | null;
  quantity: number;
  price: number;
  size: string | null;
};

export type OrderSummary = {
  id: string;
  total: number;
  email: string | null;
  phone: string | null;
  address: string | null;
  items: OrderItemSummary[];
};

const DEFAULT_RECIPIENT = process.env.ADMIN_EMAIL ?? "fluttrium@gmail.com";

const ORDER_NOTIFICATION_EMAIL =
  process.env.ORDER_NOTIFICATION_EMAIL ?? DEFAULT_RECIPIENT;

const SUBSCRIPTION_NOTIFICATION_EMAIL =
  process.env.SUBSCRIPTION_NOTIFICATION_EMAIL ?? DEFAULT_RECIPIENT;

let transporterCache: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (transporterCache) {
    return transporterCache;
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER ?? process.env.SMTP_LOGIN;
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD;

  if (host) {
    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    transporterCache = nodemailer.createTransport({
      host,
      port,
      secure,
      auth:
        user && pass
          ? {
              user,
              pass,
            }
          : undefined,
    });

    return transporterCache;
  }

  if (!pass) {
    console.warn(
      "SMTP credentials are not configured. Set SMTP_HOST or SMTP_PASS to enable email notifications."
    );
    return null;
  }

  transporterCache = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user ?? ORDER_NOTIFICATION_EMAIL,
      pass,
    },
  });

  return transporterCache;
}

export async function sendOrderNotification(order: OrderSummary) {
  const transporter = getTransporter();

  if (!transporter) {
    return;
  }

  try {
    await transporter.sendMail({
      to: ORDER_NOTIFICATION_EMAIL,
      from: process.env.SMTP_FROM ?? (process.env.SMTP_USER ?? ORDER_NOTIFICATION_EMAIL),
      subject: "У вас новый заказ",
      text: createPlainText(order),
      html: createHtml(order),
    });
  } catch (error) {
    console.error("Failed to send order notification email:", error);
  }
}

export async function sendSubscriptionNotification(email: string) {
  const transporter = getTransporter();

  if (!transporter || !email) {
    return;
  }

  // Поддержка нескольких получателей через запятую
  const recipients = SUBSCRIPTION_NOTIFICATION_EMAIL.includes(',')
    ? SUBSCRIPTION_NOTIFICATION_EMAIL.split(',').map(e => e.trim())
    : SUBSCRIPTION_NOTIFICATION_EMAIL;

  try {
    await transporter.sendMail({
      to: recipients,
      from: process.env.SMTP_FROM ?? (process.env.SMTP_USER ?? SUBSCRIPTION_NOTIFICATION_EMAIL),
      subject: "Новая подписка на рассылку",
      text: `Пользователь оставил email для рассылки: ${email}`,
      html: `<p>Пользователь оставил email для рассылки:</p><p><strong>${email}</strong></p>`,
    });
  } catch (error) {
    console.error("Failed to send subscription notification email:", error);
  }
}

function createPlainText(order: OrderSummary) {
  const lines = [
    "У вас новый заказ.",
    `Номер заказа: ${order.id}`,
    `Сумма: ${order.total.toLocaleString("ru-RU")} ₽`,
  ];

  if (order.address) {
    lines.push(`Адрес: ${order.address}`);
  }
  if (order.phone) {
    lines.push(`Телефон: ${order.phone}`);
  }
  if (order.email) {
    lines.push(`Email: ${order.email}`);
  }

  if (order.items.length > 0) {
    lines.push("Товары:");
    order.items.forEach((item) => {
      lines.push(
        `- ${item.name}${item.code ? ` (${item.code})` : ""}, размер: ${
          item.size ?? "—"
        }, количество: ${item.quantity}, цена: ${item.price.toLocaleString(
          "ru-RU"
        )} ₽`
      );
    });
  }

  return lines.join("\n");
}

function createHtml(order: OrderSummary) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #111;">
      <p>У вас новый заказ.</p>
      <p><strong>Номер заказа:</strong> ${order.id}</p>
      <p><strong>Сумма:</strong> ${order.total.toLocaleString("ru-RU")} ₽</p>
      ${order.address ? `<p><strong>Адрес:</strong> ${order.address}</p>` : ""}
      ${order.phone ? `<p><strong>Телефон:</strong> ${order.phone}</p>` : ""}
      ${order.email ? `<p><strong>Email:</strong> ${order.email}</p>` : ""}
      ${
        order.items.length
          ? `<div style="margin-top: 12px;">
              <p><strong>Товары:</strong></p>
              <ul>
                ${order.items
                  .map(
                    (item) => `
                      <li>
                        ${item.name}${item.code ? ` (${item.code})` : ""}
                        — размер: ${item.size ?? "—"}, количество: ${
                      item.quantity
                    }, цена: ${item.price.toLocaleString("ru-RU")} ₽
                      </li>
                    `
                  )
                  .join("")}
              </ul>
            </div>`
          : ""
      }
    </div>
  `;
}
