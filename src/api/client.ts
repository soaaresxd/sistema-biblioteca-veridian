const isDevelopment = (import.meta as any).env?.MODE === "development";
const DEFAULT_BASE_URL = isDevelopment ? "" : "http://localhost:8000";

const BASE_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_URL) ||
  DEFAULT_BASE_URL;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type Interceptor<T = unknown> = (context: T) => void | Promise<void>;

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface RequestContext {
  url: string;
  init: RequestInit;
}

interface ResponseContext {
  url: string;
  response: Response;
}

const requestInterceptors: Interceptor<RequestContext>[] = [];
const responseInterceptors: Interceptor<ResponseContext>[] = [];

type JsonValue =
  | Record<string, unknown>
  | Array<unknown>
  | string
  | number
  | boolean
  | null;

function buildInit(options: RequestOptions = {}): RequestInit {
  const { method = "GET", body, headers = {}, signal } = options;
  const init: RequestInit = { method, headers: { ...headers }, signal };

  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body as JsonValue);
    init.headers = {
      "Content-Type": "application/json",
      ...headers,
    };
  }

  return init;
}

async function runRequestInterceptors(context: RequestContext) {
  for (const interceptor of requestInterceptors) {
    await interceptor(context);
  }
}

async function runResponseInterceptors(context: ResponseContext) {
  for (const interceptor of responseInterceptors) {
    await interceptor(context);
  }
}

export function addRequestInterceptor(
  interceptor: Interceptor<RequestContext>
): void {
  requestInterceptors.push(interceptor);
}

export function addResponseInterceptor(
  interceptor: Interceptor<ResponseContext>
): void {
  responseInterceptors.push(interceptor);
}

export async function httpRequest<T>(
  path: string,
  options?: RequestOptions
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const init = buildInit(options);
  const context = { url, init };

  await runRequestInterceptors(context);

  const response = await fetch(context.url, context.init);
  await runResponseInterceptors({ url: context.url, response });

  const text = await response.text();

  if (!response.ok) {
    let message = `Erro: ${response.status}`;

    if (text) {
      try {
        const data = JSON.parse(text);
        if (typeof data === "string") {
          message = data;
        } else if (data?.detail) {
          if (Array.isArray(data.detail)) {
            message =
              data.detail
                .map(
                  (item: { msg?: string; detail?: string }) =>
                    item.msg || item.detail
                )
                .filter(Boolean)
                .join(", ") || message;
          } else if (typeof data.detail === "string") {
            message = data.detail;
          }
        }
      } catch {
        // ignore json parse errors
      }
    }

    throw new Error(message);
  }

  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export const apiClient = {
  request: httpRequest,
  addRequestInterceptor,
  addResponseInterceptor,
};
