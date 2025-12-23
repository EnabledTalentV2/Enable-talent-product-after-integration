import { NextResponse } from "next/server";

export function proxy(request: Request) {
    const user = true; // Replace with actual authentication logic

    if (!user) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/signup/:path+", "/dashboard/:path*", "/employer/:path+"],
};