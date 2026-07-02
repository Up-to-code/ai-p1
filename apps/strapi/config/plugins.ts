export default ({ env }: { env: (key: string, fallback?: string) => string }) => ({
  // i18n is built into Strapi v5 — no separate plugin install needed.
  // Configure it via the Internationalization settings in the admin panel,
  // or via config/middlewares.ts for default locale.
  "users-permissions": {
    enabled: true,
    config: {
      jwt: {
        expiresIn: "7d",
      },
    },
  },
});
