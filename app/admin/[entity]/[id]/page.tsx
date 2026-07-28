"use client";

import { useParams } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";

export default function AdminEntityActionPage() {
  const params = useParams();
  const entity = params.entity as string;
  const idParam = params.id as string;

  // Next.js magic: If the URL is /admin/users/new, idParam will literally be "new"
  const isNew = idParam === "new";
  const id = isNew ? undefined : idParam;

  const title = entity.charAt(0).toUpperCase() + entity.slice(1);

  // Define exactly what inputs should appear for each database table!
  const getFields = (entityName: string) => {
    switch (entityName) {
      case "users":
        return [
          { name: "name", label: "Full Name", type: "text" as const, required: true },
          { name: "email", label: "Email Address", type: "text" as const, required: true },
          { name: "location", label: "Location", type: "text" as const },
          {
            name: "role",
            label: "System Role",
            type: "select" as const,
            options: [
              { label: "Standard User", value: "USER" },
              { label: "Administrator", value: "ADMIN" }
            ],
            required: true
          },
        ];
      case "careers":
        return [
          { name: "title", label: "Job Title", type: "text" as const, required: true },
          { name: "category", label: "Industry Category", type: "text" as const },
          { name: "description", label: "Full Description", type: "textarea" as const, required: true },
          { name: "salaryMin", label: "Minimum Salary (KES)", type: "number" as const },
          { name: "salaryMax", label: "Maximum Salary (KES)", type: "number" as const },
        ];
      case "roadmaps":
        return [
          { name: "title", label: "Roadmap Title", type: "text" as const, required: true },
          { name: "description", label: "Overview Description", type: "textarea" as const },
        ];
      default:
        // Generic fallback form
        return [
          { name: "title", label: "Title", type: "text" as const, required: true },
          { name: "description", label: "Description", type: "textarea" as const },
        ];
    }
  };

  return (
    <AdminForm
      entity={entity}
      id={id}
      title={title}
      fields={getFields(entity)}
      backLink={`/admin/${entity}`}
    />
  );
}