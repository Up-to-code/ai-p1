import { describe, it, expect } from "vitest";
import {
  taskPayloadFromForm,
} from "./tasks";
import type { TaskFormValues, TaskRecord } from "../tasks.types";

describe("tasks API", () => {
  describe("taskPayloadFromForm", () => {
    it("should map all form fields correctly with complete values", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: 1,
        priority: "high",
        visibility: "team",
        assigneeUserId: "user-123",
        clientId: "client-456",
        projectId: "project-789",
        dueDate: "2024-12-31",
        description: "Task description",
        tags: "tag1, tag2, tag3",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result).toEqual({
        title: "Test Task",
        status: "todo",
        pipelineOrder: 1,
        priority: "high",
        visibility: "team",
        assigneeUserId: "user-123",
        clientId: "client-456",
        projectId: "project-789",
        dueDate: "2024-12-31",
        description: "Task description",
        tags: ["tag1", "tag2", "tag3"],
      });
    });

    it("should convert empty string IDs to undefined", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: undefined,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "tag1, tag2",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.assigneeUserId).toBeUndefined();
      expect(result.clientId).toBeUndefined();
      expect(result.projectId).toBeUndefined();
      expect(result.dueDate).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it("should convert empty tags to empty array", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "inProgress",
        priority: "normal",
        visibility: "workspace",
        assigneeUserId: "user-123",
        clientId: "client-456",
        projectId: "project-789",
        dueDate: "2024-12-31",
        description: "Description",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toEqual([]);
    });

    it("should handle whitespace-only tags", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "done",
        priority: "low",
        visibility: "private",
        assigneeUserId: "user-123",
        clientId: "client-456",
        projectId: "project-789",
        dueDate: "2024-12-31",
        description: "Description",
        tags: "  ,  ,  ",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toEqual([]);
    });

    it("should trim individual tags", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "waiting",
        priority: "urgent",
        visibility: "team",
        assigneeUserId: "user-123",
        clientId: "client-456",
        projectId: "project-789",
        dueDate: "2024-12-31",
        description: "Description",
        tags: " tag1 , tag2 , tag3 ",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should remove non-finite numeric pipelineOrder", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: Infinity,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBeUndefined();
    });

    it("should handle undefined pipelineOrder", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: undefined,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBeUndefined();
    });

    it("should preserve valid numeric pipelineOrder", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: 0,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBe(0);
    });

    it("should handle all task statuses", () => {
      const statuses: TaskFormValues["status"][] = ["todo", "inProgress", "waiting", "done", "canceled"];

      for (const status of statuses) {
        const formValues: TaskFormValues = {
          title: "Test",
          status,
          priority: "normal",
          visibility: "private",
          assigneeUserId: "",
          clientId: "",
          projectId: "",
          dueDate: "",
          description: "",
          tags: "",
        };

        const result = taskPayloadFromForm(formValues);
        expect(result.status).toBe(status);
      }
    });

    it("should handle all priorities", () => {
      const priorities: TaskFormValues["priority"][] = ["low", "normal", "high", "urgent"];

      for (const priority of priorities) {
        const formValues: TaskFormValues = {
          title: "Test",
          status: "todo",
          priority,
          visibility: "private",
          assigneeUserId: "",
          clientId: "",
          projectId: "",
          dueDate: "",
          description: "",
          tags: "",
        };

        const result = taskPayloadFromForm(formValues);
        expect(result.priority).toBe(priority);
      }
    });

    it("should handle all visibility types", () => {
      const visibilities: TaskFormValues["visibility"][] = ["private", "team", "workspace"];

      for (const visibility of visibilities) {
        const formValues: TaskFormValues = {
          title: "Test",
          status: "todo",
          priority: "normal",
          visibility,
          assigneeUserId: "",
          clientId: "",
          projectId: "",
          dueDate: "",
          description: "",
          tags: "",
        };

        const result = taskPayloadFromForm(formValues);
        expect(result.visibility).toBe(
          visibility === "team" ? "private" : visibility,
        );
      }
    });

    it("preserves team visibility when the task has a valid scope", () => {
      const result = taskPayloadFromForm({
        title: "Scoped task",
        status: "todo",
        priority: "normal",
        visibility: "team",
        assigneeUserId: "",
        clientId: "",
        projectId: "project_1",
        dueDate: "",
        description: "",
        tags: "",
      });

      expect(result.visibility).toBe("team");
    });

    it("should handle numeric string pipelineOrder", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: 42 as unknown as number,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBe(42);
    });

    it("should convert NaN pipelineOrder to undefined", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: NaN,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBeUndefined();
    });

    it("should preserve null description", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: null as unknown as string,
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.description).toBeUndefined();
    });

    it("should preserve projectId when provided", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "project-123",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.projectId).toBe("project-123");
    });

    it("should preserve clientId when provided", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "client-456",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.clientId).toBe("client-456");
    });

    it("should preserve assigneeUserId when provided", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "user-789",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.assigneeUserId).toBe("user-789");
    });

    it("should preserve dueDate when provided", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "2024-01-15",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.dueDate).toBe("2024-01-15");
    });

    it("should handle special characters in tags", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "tag-one, tag_two, tag.three",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toEqual(["tag-one", "tag_two", "tag.three"]);
    });

    it("should filter out empty tags from middle of array", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "tag1, , tag2",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toEqual(["tag1", "tag2"]);
    });

    it("should handle very long tag lists", () => {
      const tags = Array.from({ length: 100 }, (_, i) => `tag${i}`).join(", ");
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags,
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.tags).toHaveLength(100);
      expect(result.tags[0]).toBe("tag0");
      expect(result.tags[99]).toBe("tag99");
    });

    it("should handle negative pipelineOrder", () => {
      const formValues: TaskFormValues = {
        title: "Test Task",
        status: "todo",
        pipelineOrder: -5,
        priority: "normal",
        visibility: "private",
        assigneeUserId: "",
        clientId: "",
        projectId: "",
        dueDate: "",
        description: "",
        tags: "",
      };

      const result = taskPayloadFromForm(formValues);

      expect(result.pipelineOrder).toBe(-5);
    });
  });
});
