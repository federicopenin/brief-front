import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const AUTH_COOKIE_NAME = "auth_token";

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = pathSegments.join("/");

  const isPsdDownload =
    pathSegments[0] === "download" &&
    pathSegments[1]?.toLowerCase().endsWith(".psd");

  const url = isPsdDownload
    ? `${API_BASE_URL}/psd/stream/${pathSegments[1]}`
    : `${API_BASE_URL}/psd/${path}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const response = await fetch(url, {
    method: request.method,
    headers,
    body: request.body,
    // @ts-expect-error - duplex is required for streaming but not in types yet
    duplex: "half",
  });

  if (response.status === 401) {
    const res = NextResponse.json(
      { error: "Session expired" },
      { status: 401 },
    );
    res.cookies.delete(AUTH_COOKIE_NAME);
    return res;
  }

  const responseHeaders: HeadersInit = {
    "Content-Type":
      response.headers.get("content-type") || "application/octet-stream",
    "Content-Disposition": response.headers.get("content-disposition") || "",
  };

  if (isPsdDownload) {
    responseHeaders["Transfer-Encoding"] = "chunked";
  }

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
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
