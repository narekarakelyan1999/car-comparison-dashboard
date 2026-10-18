import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { catalogApi } from "@/features/catalog/api/catalog-api";
import type { SearchParamRecord } from "@/features/catalog/model/parse-catalog-query";
import { comparisonApi } from "@/features/comparison/api/comparison-api";

const CATALOG_PATH = "/";
const COMPARE_PATH = "/compare";

function searchParamsFrom(searchParams: URLSearchParams): SearchParamRecord {
  const params: SearchParamRecord = {};

  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);

    params[key] = values.length > 1 ? values : values[0];
  }

  return params;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== CATALOG_PATH && pathname !== COMPARE_PATH) {
    return NextResponse.next();
  }

  const params = searchParamsFrom(request.nextUrl.searchParams);
  const redirectHref =
    pathname === CATALOG_PATH
      ? catalogApi.loadPage(params).redirectHref
      : comparisonApi.loadPage(params).redirectHref;

  if (!redirectHref) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirectHref, request.url), 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
