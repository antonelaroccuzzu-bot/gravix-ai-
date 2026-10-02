import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next");
  const destination =
    next === "/reset-password" ? "/reset-password" : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(
        new URL(destination, url.origin)
      );
    }

    console.error("Auth callback error:", error.message);
  }

  return NextResponse.redirect(
    new URL("/login?error=confirmation_failed", url.origin)
  );
}