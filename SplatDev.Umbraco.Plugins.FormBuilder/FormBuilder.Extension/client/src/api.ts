import type {
  FormListItem,
  Form,
  CreateFormRequest,
  UpdateFormRequest,
} from "./types";

const API_BASE = "/umbraco/backoffice/formbuilderextension/api/v1";

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const formBuilderApi = {
  getForms(): Promise<FormListItem[]> {
    return request<FormListItem[]>("/forms");
  },

  getForm(id: number): Promise<Form> {
    return request<Form>(`/forms/${id}`);
  },

  createForm(data: CreateFormRequest): Promise<Form> {
    return request<Form>("/forms", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateForm(id: number, data: UpdateFormRequest): Promise<Form> {
    return request<Form>(`/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteForm(id: number): Promise<void> {
    return request<void>(`/forms/${id}`, { method: "DELETE" });
  },

  reorderFields(formId: number, fieldOrder: Record<number, number>): Promise<void> {
    return request<void>(`/forms/${formId}/fields/order`, {
      method: "PUT",
      body: JSON.stringify(fieldOrder),
    });
  },
};
