import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_COOKIE_NAME = "auth_token";

function getToken(request: NextRequest): string | null {
  const cookieHeader = request.headers.get("cookie") || "";
  return (
    cookieHeader
      .split(";")
      .find((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`))
      ?.split("=")[1] || null
  );
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const token = getToken(request);

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = pathSegments.length > 0 ? `/${pathSegments.join("/")}` : "";
  const url = `${API_BASE_URL}/brief${path}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  let body: string | undefined;
  if (request.method === "POST" || request.method === "PATCH") {
    body = await request.text();
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

  try {
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Request processed" },
      { status: response.status },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}
