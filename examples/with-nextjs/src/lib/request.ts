type RequestPayload = Record<string, string>;

const normalizeValue = (value: FormDataEntryValue): string =>
  typeof value === "string" ? value : value.name;

const fromFormData = (formData: FormData): RequestPayload => {
  const payload: RequestPayload = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = normalizeValue(value);
  }
  return payload;
};

export const getRequestPayload = async (request: Request) => {
  if (request.method === "GET") {
    return Object.fromEntries(new URL(request.url).searchParams.entries());
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown> | null;
    if (!body) return {};
    return Object.fromEntries(
      Object.entries(body).map(([key, value]) => [key, String(value)]),
    );
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    return fromFormData(formData);
  }

  return {};
};
