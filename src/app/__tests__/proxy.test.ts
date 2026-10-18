import { NextRequest } from "next/server";

import { describe, expect, it } from "vitest";

import { proxy } from "../../proxy";

function responseFor(path: string) {
  return proxy(new NextRequest(`http://localhost:3000${path}`));
}

describe("catalog proxy", () => {
  it("redirects an explicit first page and an out-of-range page before render", () => {
    const firstPage = responseFor("/?page=1");
    const tooFar = responseFor("/?brand=bmw&page=99");
    const currentPage = responseFor("/?page=2");
    const belowRange = responseFor("/?minPrice=1");
    const tooFarPage = responseFor("/?page=99");
    const compare = responseFor("/compare?ids=toyota-camry,honda-accord");
    const canonicalCompare = responseFor("/compare?ids=honda-accord,toyota-camry");
    const unknownCompare = responseFor("/compare?ids=toyota-camry,not-a-car");

    expect(firstPage.status).toBe(307);
    expect(firstPage.headers.get("location")).toBe("http://localhost:3000/");
    expect(tooFar.status).toBe(307);
    expect(tooFar.headers.get("location")).toBe("http://localhost:3000/?brand=bmw");
    expect(currentPage.status).toBe(200);
    expect(currentPage.headers.get("location")).toBeNull();
    expect(belowRange.status).toBe(307);
    expect(belowRange.headers.get("location")).toBe("http://localhost:3000/");
    expect(tooFarPage.status).toBe(307);
    expect(tooFarPage.headers.get("location")).toBe("http://localhost:3000/?page=3");
    expect(compare.status).toBe(307);
    expect(compare.headers.get("location")).toBe(
      "http://localhost:3000/compare?ids=honda-accord,toyota-camry",
    );
    expect(canonicalCompare.status).toBe(200);
    expect(unknownCompare.status).toBe(307);
    expect(unknownCompare.headers.get("location")).toBe(
      "http://localhost:3000/compare?ids=toyota-camry",
    );
  });
});
