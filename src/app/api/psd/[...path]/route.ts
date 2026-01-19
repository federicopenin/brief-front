import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_COOKIE_NAME = "auth_token";

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = pathSegments.join("/");
  const url = `${API_BASE_URL}/psd/${path}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  };

  const contentType = request.headers.get("content-type");
  if (contentType && !contentType.includes("multipart/form-data")) {
    headers["Content-Type"] = contentType;
  }

  let body: BodyInit | null = null;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (contentType?.includes("application/json")) {
      body = await request.text();
    } else {
      body = await request.arrayBuffer();
    }
  }

  const response = await fetch(url, {
    method: request.method,
    headers,
    body,
  });

  if (response.status === 401) {
    const res = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  const responseContentType = response.headers.get("content-type") || "";

  if (
    responseContentType.includes("image") ||
    responseContentType.includes("application/pdf") ||
    responseContentType.includes("application/octet-stream")
  ) {
    const arrayBuffer = await response.arrayBuffer();
    return new NextResponse(arrayBuffer, {
      status: response.status,
      headers: {
        "Content-Type": responseContentType,
        "Content-Disposition":
          response.headers.get("content-disposition") || "",
      },
    });
  }

  const data = await response.text();
  return new NextResponse(data, {
    status: response.status,
    headers: { "Content-Type": responseContentType },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path);
}
