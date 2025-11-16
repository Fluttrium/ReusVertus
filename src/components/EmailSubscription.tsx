"use client";

import { useState } from "react";

type EmailSubscriptionVariant = "green" | "beige";

type EmailSubscriptionProps = {
  variant?: EmailSubscriptionVariant;
};

function EmailSubscriptionBase({ variant = "green" }: EmailSubscriptionProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem("email_subscribed", "true");
        localStorage.setItem("subscribed_email", email);
      }

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Не удалось оформить подписку");
      }

      setEmail("");
      alert("Спасибо за подписку!");
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Не удалось оформить подписку. Попробуйте позже.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isGreenVariant = variant === "green";
  const containerClass = isGreenVariant ? "bg-bg-4" : "bg-[#FFF8F0]";
  const headingColor = isGreenVariant ? "text-[#FFF8F0]" : "text-bg-4";
  const textColor = isGreenVariant ? "text-[#FFF8F0]" : "text-bg-4";
  const inputClasses = isGreenVariant
    ? "flex-1 px-4 py-3 border-2 border-[#FFF8F0]/30 bg-[#FFF8F0]/10 backdrop-blur-sm rounded-lg focus:outline-none focus:border-[#FFF8F0] text-[#FFF8F0] placeholder:text-[#FFF8F0]/60 uppercase text-sm"
    : "flex-1 px-4 py-3 border-2 border-bg-4/30 bg-bg-4/10 backdrop-blur-sm rounded-lg focus:outline-none focus:border-bg-4 text-bg-4 placeholder:text-bg-4/60 uppercase text-sm";
  const buttonClasses = isGreenVariant
    ? "bg-[#FFF8F0] text-bg-4"
    : "bg-bg-4 text-[#FFF8F0]";

  return (
    <div className={`mb-12 ${containerClass} rounded-lg`}>
      <div className="relative w-full flex flex-col items-center justify-center p-6 md:p-8">
        <div className="text-center space-y-4 z-10 max-w-2xl w-full">
          <p
            className={`text-xl md:text-xl lg:text-2xl uppercase font-medium leading-snug md:leading-tight ${headingColor}`}
            style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 500 }}
          >
            Скидка 10% за подписку
            <br className="block sm:hidden" />
            на EMAIL-РАССЫЛКУ
          </p>
          <p
            className={`text-xs md:text-sm opacity-90 ${textColor}`}
            style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 400 }}
          >
            Промокод действует на первую покупку (исключая товары со скидкой)
          </p>
          {/* Форма подписки */}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ваш email"
              className={inputClasses}
              required
              disabled={isSubmitting}
              style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 400 }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonClasses} px-6 py-3 uppercase rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap font-medium text-sm disabled:opacity-50`}
              style={{ fontFamily: 'var(--font-ibm-plex-mono)', fontWeight: 500 }}
            >
              {isSubmitting ? "Отправка..." : "Подписаться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function EmailSubscriptionGreen(props: EmailSubscriptionProps) {
  return <EmailSubscriptionBase {...props} variant="green" />;
}

export function EmailSubscriptionBeige(props: EmailSubscriptionProps) {
  return <EmailSubscriptionBase {...props} variant="beige" />;
}

export default EmailSubscriptionGreen;
