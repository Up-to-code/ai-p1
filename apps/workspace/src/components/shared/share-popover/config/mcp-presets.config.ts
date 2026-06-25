/** MCP preset ids shown in the share MCP dialog. */
export const shareMcpPresetIds = ["client", "calendar", "full"] as const;

export type ShareMcpPresetId = (typeof shareMcpPresetIds)[number];

export const shareMcpDefaultPreset: ShareMcpPresetId = "client";
