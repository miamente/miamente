import { getRequestConfig } from "next-intl/server";

const supportedLocales = ["es", "en"] as const;
type SupportedLocale = (typeof supportedLocales)[number];

function isSupportedLocale(locale: string): locale is SupportedLocale {
  return (supportedLocales as readonly string[]).includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  const current = locale ?? "es";
  const normalized: SupportedLocale = isSupportedLocale(current) ? current : "es";
  return {
    locale: normalized,
    messages: (await import(`./messages/${normalized}.json`)).default,
  };
});
