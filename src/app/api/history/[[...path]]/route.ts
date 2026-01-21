import { NextRequest, NextResponse } from "next/server";

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
  const url = path
    ? `${API_BASE_URL}/history/${path}`
    : `${API_BASE_URL}/history`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    method: request.method,
    headers,
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
  const responseContentLength = response.headers.get("content-length");
  const responseContentDisposition = response.headers.get(
    "content-disposition",
  );

  const responseHeaders: HeadersInit = {
    "Content-Type": responseContentType,
  };

  if (responseContentLength) {
    responseHeaders["Content-Length"] = responseContentLength;
  }

  if (responseContentDisposition) {
    responseHeaders["Content-Disposition"] = responseContentDisposition;
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}
