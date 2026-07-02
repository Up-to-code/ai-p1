import path from "node:path";

export default ({ env }: { env: (key: string, fallback?: string) => string }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  const connections: Record<string, object> = {
    sqlite: {
      connection: {
        filename: path.join(
          __dirname,
          "..",
          env("DATABASE_FILENAME", ".tmp/data.db"),
        ),
      },
      useNullAsDefault: true,
    },
    postgres: {
      connection: {
        host: env("DATABASE_HOST", "localhost"),
        port: parseInt(env("DATABASE_PORT", "5432"), 10),
        database: env("DATABASE_NAME", "qentrah_cms"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", ""),
        ssl: env("DATABASE_SSL", "false") === "true"
          ? { rejectUnauthorized: false }
          : false,
      },
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: 60000,
    },
  };
};
