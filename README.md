Этот проект на [Next.js](https://nextjs.org) создан с помощью [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Как начать

Сначала запустите сервер разработки:

```bash
npm run dev
# или
yarn dev
# или
pnpm dev
# или
bun dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере, чтобы увидеть результат.

Изменения можно вносить, редактируя файл `app/page.tsx` — страница будет обновляться автоматически.

Проект использует [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) для автоматической оптимизации и загрузки шрифта [Geist](https://vercel.com/font).

## Почтовые уведомления о заказах

Для отправки уведомлений о новых заказах используется Nodemailer. Чтобы подключить Gmail через пароль приложения, выполните следующие шаги:

1. Включите двухфакторную аутентификацию для почты `fluttrium@gmail.com` (или другой используемой учётной записи Google).
2. В Google Account перейдите в «Безопасность» → «Пароли приложений» и сгенерируйте пароль приложения.
3. Добавьте переменные окружения (локально в `.env.local`, на Vercel — в Project → Settings → Environment Variables):

```
SMTP_USER=fluttrium@gmail.com
SMTP_PASS=пароль-приложения-google
ORDER_NOTIFICATION_EMAIL=fluttrium@gmail.com
```

`SMTP_PASS` — это пароль приложения из шага 2. Если нужно отправлять с другого адреса или на другой адрес, измените значения `SMTP_USER` и `ORDER_NOTIFICATION_EMAIL`.

Дополнительные настройки:

- `SMTP_FROM` — явное значение заголовка From (по умолчанию используется `SMTP_USER`)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` — кастомные параметры SMTP, если вы используете не Gmail
