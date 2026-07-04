import { defineDynamic, defineInstructions } from "eve/instructions";

export default defineDynamic({
  events: {
    "session.started": async (_event, ctx) => {
      const role = ctx.session.auth.current?.attributes?.role ?? "member";
      return defineInstructions({
        markdown: [
          "## Your effective role",
          "",
          `Your effective role is: **${role}**`,
          "",
          "You can ONLY use tools permitted for this role.",
          "Do not attempt operations that require a higher role.",
          "If you need admin-level access, tell the user to contact an organization admin.",
        ].join("\n"),
      });
    },
  },
});
