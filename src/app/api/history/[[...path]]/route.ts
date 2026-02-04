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

  const isPresignedUrl = pathSegments.length === 3 && pathSegments[1] === "url";
  const isDownload = pathSegments.length === 2;
  const [id, format] = pathSegments;
  const isPsdDownload = isDownload && format === "psd";
  let url: string;

  if (isPresignedUrl) {
    const [historyId, , urlFormat] = pathSegments;
    url = `${API_BASE_URL}/history/${historyId}/url/${urlFormat}`;
  } else if (isPsdDownload) {
    url = `${API_BASE_URL}/history/${id}/stream/${format}`;
  } else if (isDownload) {
    url = `${API_BASE_URL}/history/${id}/${format}`;
  } else if (pathSegments.length > 0) {
    url = `${API_BASE_URL}/history/${pathSegments.join("/")}`;
  } else {
    url = `${API_BASE_URL}/history`;
  }

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
  const responseContentDisposition = response.headers.get(
    "content-disposition",
  );

  if (
    responseContentType.includes("image") ||
    responseContentType.includes("application/pdf") ||
    responseContentType.includes("application/octet-stream")
  ) {
    const streamHeaders: HeadersInit = {
      "Content-Type": responseContentType || "application/octet-stream",
    };

    if (isPsdDownload) {
      streamHeaders["Transfer-Encoding"] = "chunked";
    }
    if (responseContentDisposition) {
      streamHeaders["Content-Disposition"] = responseContentDisposition;
    }

    return new Response(response.body, {
      status: response.status,
      headers: streamHeaders,
    });
  }

  try {
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = buffer.toString("utf-8");

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: response.status });
    } catch (e) {
      return NextResponse.json([], { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({ error: "Proxy error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> },
) {
  const { path } = await params;
  return proxyRequest(request, path || []);
}
