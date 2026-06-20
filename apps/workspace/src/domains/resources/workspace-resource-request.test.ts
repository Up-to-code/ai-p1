import { describe, it, expect } from "vitest";
import { organizationApiPath } from "./workspace-resource-request";

describe("workspace-resource-request", () => {
  describe("organizationApiPath", () => {
    it("should build base organization path without segments", () => {
      expect(organizationApiPath("org-123")).toBe("/api/v1/organizations/org-123");
    });

    it("should append single segment", () => {
      expect(organizationApiPath("org-123", "tasks")).toBe("/api/v1/organizations/org-123/tasks");
    });

    it("should append multiple segments", () => {
      expect(organizationApiPath("org-123", "tasks", "abc")).toBe("/api/v1/organizations/org-123/tasks/abc");
    });

    it("should encode special characters in organizationId", () => {
      expect(organizationApiPath("org/123", "tasks")).toBe("/api/v1/organizations/org%2F123/tasks");
    });

    it("should encode spaces in segments", () => {
      expect(organizationApiPath("org-123", "my tasks")).toBe("/api/v1/organizations/org-123/my%20tasks");
    });

    it("should encode Unicode characters", () => {
      expect(organizationApiPath("org-123", "tâsk")).toBe("/api/v1/organizations/org-123/t%C3%A2sk");
    });

    it("should encode leading slash in segment", () => {
      expect(organizationApiPath("org-123", "/tasks")).toBe("/api/v1/organizations/org-123/%2Ftasks");
    });

    it("should handle empty string organizationId", () => {
      expect(organizationApiPath("", "tasks")).toBe("/api/v1/organizations//tasks");
    });
  });
});