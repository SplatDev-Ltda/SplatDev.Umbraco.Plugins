export interface FormListItem {
  id: number;
  name: string;
  category: string;
  createdDate: string;
  updatedDate: string;
  fieldCount: number;
}

export interface FormField {
  id: number;
  alias: string;
  formId: number;
  label: string;
  placeholder: string;
  type: string;
  isRequired: boolean;
  minLength: number;
  regex: string | null;
  sortOrder: number;
  dropdownValues: DropdownValue[];
}

export interface DropdownValue {
  id: number;
  fieldId: number;
  value: string;
}

export interface Form {
  id: number;
  name: string;
  category: string;
  createdDate: string;
  updatedDate: string;
  fields: FormField[];
}

export interface FieldRequest {
  id?: number;
  alias?: string;
  label?: string;
  placeholder?: string;
  type?: string;
  isRequired?: boolean;
  minLength?: number;
  regex?: string;
  dropdownValues?: string[];
}

export interface CreateFormRequest {
  name: string;
  category?: string;
  fields?: FieldRequest[];
}

export interface UpdateFormRequest {
  name: string;
  category?: string;
  fields?: FieldRequest[];
}

export const FIELD_TYPES = [
  { value: "TextBox", label: "Text" },
  { value: "Textarea", label: "Text Area" },
  { value: "Number", label: "Number" },
  { value: "Email", label: "Email" },
  { value: "Password", label: "Password" },
  { value: "Date", label: "Date" },
  { value: "Checkbox", label: "Checkbox" },
  { value: "Dropdown", label: "Dropdown" },
  { value: "RadioButtonList", label: "Radio Button List" },
  { value: "FileUpload", label: "File Upload" },
  { value: "Hidden", label: "Hidden" },
];
