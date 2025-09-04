import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["es", "en"],
  defaultLocale: "es",
  localeDetection: true,
});

export const config = {
  // eslint-disable-next-line no-useless-escape
  matcher: ["/((?!_next|.*\..*).*)"],
};
