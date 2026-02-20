import { NextRequest, NextResponse } from "next/server";

const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";
const GOOGLE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text";
const MAX_RESULTS = 5;
const MIN_QUERY_LENGTH = 3;
const REQUEST_TIMEOUT_MS = 5000;

type GoogleAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: { text?: string };
      structuredFormat?: {
        mainText?: { text?: string };
        secondaryText?: { text?: string };
      };
    };
  }>;
  error?: {
    message?: string;
  };
};

type PlacePrediction = NonNullable<
  NonNullable<GoogleAutocompleteResponse["suggestions"]>[number]["placePrediction"]
>;

type LocationSuggestion = {
  placeId: string;
  label: string;
};

const toTrimmedString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const normalizeSuggestion = (
  prediction: PlacePrediction | undefined
): LocationSuggestion | null => {
  if (!prediction) return null;

  const placeId = toTrimmedString(prediction.placeId);
  if (!placeId) return null;

  const mainText = toTrimmedString(prediction.structuredFormat?.mainText?.text);
  const secondaryText = toTrimmedString(
    prediction.structuredFormat?.secondaryText?.text
  );
  const fallbackText = toTrimmedString(prediction.text?.text);
  const label =
    [mainText, secondaryText].filter(Boolean).join(", ") || fallbackText;

  if (!label) return null;

  return { placeId, label };
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    console.error("[Places API] Missing GOOGLE_PLACES_API_KEY");
    return NextResponse.json(
      { error: "Places autocomplete is not configured." },
      { status: 500 }
    );
  }

  const query = toTrimmedString(request.nextUrl.searchParams.get("query"));
  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { suggestions: [] as LocationSuggestion[] },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  const sessionToken = toTrimmedString(
    request.nextUrl.searchParams.get("sessionToken")
  );

  const payload: Record<string, unknown> = {
    input: query,
    languageCode: "en",
    includedPrimaryTypes: ["(cities)"],
  };
  if (sessionToken) {
    payload.sessionToken = sessionToken;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": GOOGLE_FIELD_MASK,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: controller.signal,
    });

    const responseText = await upstreamResponse.text();
    if (!upstreamResponse.ok) {
      console.error(
        `[Places API] Upstream error ${upstreamResponse.status}:`,
        responseText.slice(0, 500)
      );
      return NextResponse.json(
        { error: "Failed to fetch places suggestions." },
        { status: upstreamResponse.status }
      );
    }

    let upstreamData: GoogleAutocompleteResponse;
    try {
      upstreamData = JSON.parse(responseText) as GoogleAutocompleteResponse;
    } catch {
      console.error("[Places API] Invalid upstream JSON response");
      return NextResponse.json(
        { error: "Invalid places autocomplete response." },
        { status: 502 }
      );
    }

    const seen = new Set<string>();
    const suggestions = (upstreamData.suggestions ?? [])
      .map((entry) => normalizeSuggestion(entry.placePrediction))
      .filter((entry): entry is LocationSuggestion => Boolean(entry))
      .filter((entry) => {
        if (seen.has(entry.placeId)) return false;
        seen.add(entry.placeId);
        return true;
      })
      .slice(0, MAX_RESULTS);

    return NextResponse.json(
      { suggestions },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Places autocomplete request timed out." },
        { status: 504 }
      );
    }
    console.error("[Places API] Autocomplete request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch places suggestions." },
      { status: 500 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
