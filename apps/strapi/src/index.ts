/**
 * Qentrah Strapi CMS — application bootstrap.
 *
 * `register` runs before the server starts (extend Strapi internals here).
 * `bootstrap` runs after all plugins are loaded (seed data, set permissions, etc.).
 */

export default {
  /**
   * An asynchronous register function that runs before
   * your application gets registered.
   */
  register(/* { strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    // Ensure Public role has read access to all published content
    const publicRole = await strapi
      .query("plugin::users-permissions.role")
      .findOne({ where: { type: "public" } });

    if (!publicRole) return;

    const permissions = await strapi
      .query("plugin::users-permissions.permission")
      .findMany({ where: { role: publicRole.id } });

    const findPermission = (action: string) =>
      permissions.find((p: any) => p.action === action);

    const collectionApis = [
      "api::blog-post.blog-post",
      "api::marketing-page.marketing-page",
      "api::landing-section.landing-section",
      "api::legal-page.legal-page",
      "api::team-member.team-member",
      "api::faq.faq",
      "api::pricing-plan.pricing-plan",
    ];

    for (const api of collectionApis) {
      const findAction = `${api}.find`;
      const findOneAction = `${api}.findOne`;

      if (!findPermission(findAction)) {
        await strapi.query("plugin::users-permissions.permission").create({
          data: { action: findAction, role: publicRole.id, enabled: true },
        });
      }
      if (!findPermission(findOneAction)) {
        await strapi.query("plugin::users-permissions.permission").create({
          data: { action: findOneAction, role: publicRole.id, enabled: true },
        });
      }
    }
  },
};
