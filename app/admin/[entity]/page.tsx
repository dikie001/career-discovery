"use client";

import { useParams } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";

export default function DynamicAdminEntityPage() {
  const params = useParams();
  const entity = params.entity as string;

  // Capitalize the title (e.g., 'users' -> 'Users')
  const title = entity.charAt(0).toUpperCase() + entity.slice(1);

  // Dynamically assign columns based on which sidebar link you clicked
  const getColumns = (entityName: string) => {
    switch (entityName) {
      case "users":
        return [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
        ];
      case "careers":
        return [
          { key: "title", label: "Job Title" },
          { key: "category", label: "Category" },
          { key: "salaryMin", label: "Min Salary" },
        ];
      case "roadmaps":
        return [
          { key: "title", label: "Roadmap Name" },
          { key: "description", label: "Description" },
        ];
      default:
        // Fallback for any other table
        return [
          { key: "id", label: "ID" },
          { key: "createdAt", label: "Created At" },
        ];
    }
  };

  return (
    <DataTable
      entity={entity}
      title={`Manage ${title}`}
      columns={getColumns(entity)}
      createLink={`/admin/${entity}/new`}
    />
  );
}