import { NextRequest, NextResponse } from "next/server";

function normalizeOrigin(request: NextRequest) {
  const headerValue = request.headers.get("origin");
  if (!headerValue || !headerValue.includes(",")) {
    return NextResponse.next();
  }

  const origins = headerValue
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length < 2 || new Set(origins).size !== 1) {
    return new NextResponse("Não foi possível validar a origem da solicitação.", { status: 400 });
  }

  try {
    const origin = new URL(origins[0]);
    if (!origin.protocol || !origin.host) {
      return new NextResponse("Não foi possível validar a origem da solicitação.", { status: 400 });
    }
  } catch {
    return new NextResponse("Não foi possível validar a origem da solicitação.", { status: 400 });
  }

  const headers = new Headers(request.headers);
  headers.set("origin", origins[0]);

  return NextResponse.next({ request: { headers } });
}

export function middleware(request: NextRequest) {
  return normalizeOrigin(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
