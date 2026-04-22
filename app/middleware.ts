// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const role = "SALES"; // sau này lấy từ token

//   if (request.nextUrl.pathname.startsWith("/system")) {
//     if (role !== "ADMIN") {
//       return NextResponse.redirect(new URL("/403", request.url));
//     }
//   }

//   return NextResponse.next();
// }