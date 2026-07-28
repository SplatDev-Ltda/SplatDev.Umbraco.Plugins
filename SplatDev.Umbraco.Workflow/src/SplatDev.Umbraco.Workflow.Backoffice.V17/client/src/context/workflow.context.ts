import { UmbContextBase } from "@umbraco-cms/backoffice/class-api";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";

export interface WorkflowDefinitionDto {
  key: string;
  label: string;
  version: number;
  isActive: boolean;
  definitionJson: string;
  createdAt: string;
}

export interface WorkflowInstanceDto {
  id: number;
  workflowKey: string;
  workflowVersion: number;
  currentStepKey: string;
  status: number;
  metadataJson: string | null;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface WorkflowDisplayRow {
  instanceId: number;
  values: Record<string, unknown>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface TransitionResult {
  success: boolean;
  newStepKey: string;
  error: string | null;
}

export interface WorkflowQueueFilter {
  workflowKey?: string;
  status?: number;
  assignedToMe?: boolean;
  group?: string;
  department?: string;
  freeText?: string;
  page?: number;
  pageSize?: number;
}

export interface WorkflowEvent {
  instanceId: number;
  eventType: number;
  fromStepKey: string | null;
  toStepKey: string | null;
  actionKey: string | null;
  payloadJson: string | null;
  actorUsername: string;
  occurredAt: string;
}

export interface WorkflowStepDisplay {
  key: string;
  label: string;
  actions: WorkflowActionDisplay[];
  department?: string;
  group?: string;
}

export interface WorkflowActionDisplay {
  key: string;
  label: string;
  nextStepKey: string;
  assignment: number;
}

export interface WorkflowTheme {
  name: string;
  label: string;
}

export const WORKFLOW_CONTEXT_TOKEN =
  new UmbContextToken<WorkflowContext>("SplatDev.Workflow.Context");

export class WorkflowContext extends UmbContextBase<WorkflowContext> {
  #base = "/umbraco/backoffice/SplatDevWorkflow";

  constructor(host: UmbControllerHost) {
    super(host, WORKFLOW_CONTEXT_TOKEN);
  }

  async #get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.#base}${path}`, window.location.origin);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const resp = await fetch(url.toString());
    if (!resp.ok) throw new Error(`GET ${path} failed: ${resp.status}`);
    return resp.json();
  }

  async #post<T>(path: string, body: unknown): Promise<T> {
    const resp = await fetch(`${this.#base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) throw new Error(`POST ${path} failed: ${resp.status}`);
    return resp.json();
  }

  async getInstances(filter: WorkflowQueueFilter): Promise<PagedResult<WorkflowDisplayRow>> {
    const params: Record<string, string> = {};
    if (filter.workflowKey) params.workflowKey = filter.workflowKey;
    if (filter.status !== undefined) params.status = String(filter.status);
    if (filter.assignedToMe) params.assignedToMe = "true";
    if (filter.group) params.group = filter.group;
    if (filter.department) params.department = filter.department;
    if (filter.freeText) params.freeText = filter.freeText;
    params.page = String(filter.page ?? 1);
    params.pageSize = String(filter.pageSize ?? 50);
    return this.#get("/WorkflowInstances/List", params);
  }

  async getInstance(id: number): Promise<WorkflowInstanceDto> {
    return this.#get(`/WorkflowInstances/Get/${id}`);
  }

  async createInstance(workflowKey: string, metadataJson?: string): Promise<WorkflowInstanceDto> {
    return this.#post("/WorkflowInstances/Create", { workflowKey, metadataJson });
  }

  async transition(id: number, actionKey: string): Promise<TransitionResult> {
    return this.#post(`/WorkflowInstances/Transition/${id}`, { actionKey });
  }

  async getDefinitions(): Promise<WorkflowDefinitionDto[]> {
    return this.#get("/WorkflowDefinitions/List");
  }

  async getDefinition(key: string): Promise<WorkflowDefinitionDto> {
    return this.#get(`/WorkflowDefinitions/Get/${key}`);
  }

  async saveDefinition(dto: WorkflowDefinitionDto): Promise<void> {
    await this.#post("/WorkflowDefinitions/Save", dto);
  }

  async getThemes(): Promise<WorkflowTheme[]> {
    return this.#get("/WorkflowThemes/List");
  }

  async getTheme(name: string): Promise<WorkflowTheme> {
    return this.#get(`/WorkflowThemes/Get/${name}`);
  }

  parseDefinition(json: string): { steps: WorkflowStepDisplay[] } {
    try {
      return JSON.parse(json);
    } catch {
      return { steps: [] };
    }
  }
}
