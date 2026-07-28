"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "checkbox";
  options?: { label: string; value: string }[];
  required?: boolean;
}

interface AdminFormProps {
  entity: string;
  id?: string; // If provided, it's edit mode
  title: string;
  fields: Field[];
  backLink: string;
}

export function AdminForm({ entity, id, title, fields, backLink }: AdminFormProps) {
  const { token } = useAuth();
  const router = useRouter();
  
  // Strongly typed state instead of 'any'
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      const fetchRecord = async () => {
        try {
          const res = await fetch(`/api/admin/${entity}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to fetch record");
          setFormData(json.data || {});
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch record");
        } finally {
          setFetching(false);
        }
      };
      fetchRecord();
    }
  }, [id, token, entity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const url = id ? `/api/admin/${entity}/${id}` : `/api/admin/${entity}`;
      const method = id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      
      router.push(backLink);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={backLink}
          className="rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {id ? `Edit ${title}` : `Create ${title}`}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/30 p-4 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-950 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 space-y-6">
          {fields.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label htmlFor={field.name} className="text-sm font-medium text-slate-900 dark:text-slate-200">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === "textarea" ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={(formData[field.name] as string) || ""}
                  onChange={handleChange}
                  rows={4}
                  className="block w-full rounded-lg border-0 py-2 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-transparent sm:text-sm sm:leading-6 transition-shadow"
                />
              ) : field.type === "select" ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={(formData[field.name] as string) || ""}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-0 py-2.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-transparent sm:text-sm sm:leading-6"
                >
                  <option value="">Select...</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={field.name}
                    name={field.name}
                    checked={(formData[field.name] as boolean) || false}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <span className="text-sm text-slate-500">Enable</span>
                </div>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={(formData[field.name] as string | number) || ""}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-0 py-2 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 bg-transparent sm:text-sm sm:leading-6 transition-shadow"
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-end gap-x-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 py-4">
          <Link
            href={backLink}
            className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 hover:text-slate-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {id ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}