"use client";

import { useState, useEffect, useRef, useId, KeyboardEvent, type Ref } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";

interface LocationAutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  inputId?: string;
  inputName?: string;
  inputRef?: Ref<HTMLInputElement>;
  required?: boolean;
  describedBy?: string;
  ariaLabel?: string;
  placeholder?: string;
}

interface OSMResult {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export default function LocationAutocomplete({
  label = "Location",
  value,
  onChange,
  error,
  disabled,
  inputId,
  inputName,
  inputRef,
  required,
  describedBy,
  ariaLabel,
  placeholder,
}: LocationAutocompleteProps) {
  const generatedId = useId();
  const resolvedInputId = inputId ?? `location-${generatedId}`;
  const listboxId = `${resolvedInputId}-suggestions`;
  const errorId = error ? `${resolvedInputId}-error` : undefined;
  const describedByIds = [describedBy, errorId].filter(Boolean).join(" ") || undefined;
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<OSMResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Sync internal query with external value (for initial load)
  useEffect(() => {
    if (value !== query) {
      setQuery(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect (1 second to respect Nominatim TOS)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // Only search if query changed significantly and isn't just the initial value
      if (query.length < 3 || !isOpen) return;

      setIsLoading(true);
      try {
        // Query param 'featuretype=city' prioritizes cities
        // 'addressdetails=1' allows us to format the display name neatly
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&addressdetails=1&limit=5&featuretype=city`,
          {
            headers: {
              // REQUIRED by Nominatim Usage Policy - User-Agent
              "User-Agent": "EnabledTalent-Platform/1.0",
            },
          },
        );

        if (response.ok) {
          const data: OSMResult[] = await response.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error("OSM Search Error", err);
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onChange(e.target.value); // Update parent immediately
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const formatAddress = (place: OSMResult) => {
    // Prefer "City, State, Country" format
    const parts = [
      place.address.city || place.address.town || place.address.village,
      place.address.state,
      place.address.country,
    ].filter(Boolean);

    // Fallback to display_name if address parts are missing
    return parts.length > 0 ? parts.join(", ") : place.display_name;
  };

  const handleSelect = (place: OSMResult) => {
    const formatted = formatAddress(place);
    setQuery(formatted);
    onChange(formatted);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      // Ensure the selected item scrolls into view
      if (activeIndex + 1 < suggestions.length) {
        const element = listboxRef.current?.children[
          activeIndex + 1
        ] as HTMLElement;
        element?.scrollIntoView({ block: "nearest" });
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  // Screen reader status message construction
  const a11yStatus = isLoading
    ? "Searching for locations..."
    : suggestions.length > 0 && isOpen
      ? `${suggestions.length} locations found. Use up and down arrow keys to navigate.`
      : "";

  return (
    <div className="w-full relative" ref={wrapperRef}>
      {label && (
        <label htmlFor={resolvedInputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Accessible Live Region */}
      <div className="sr-only" role="status" aria-live="polite">
        {a11yStatus}
      </div>

      <div className="relative">
        <input
          id={resolvedInputId}
          name={inputName}
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          disabled={disabled}
          placeholder={placeholder ?? "e.g. Mississauga, Ontario"}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
            error ? "border-red-500" : "border-gray-200"
          } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0
              ? `${resolvedInputId}-item-${activeIndex}`
              : undefined
          }
          aria-describedby={describedByIds}
          aria-label={ariaLabel}
          aria-required={required || undefined}
          aria-invalid={error ? true : undefined}
          required={required}
          role="combobox"
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto overflow-x-hidden"
        >
          {suggestions.map((place, index) => (
            <li
              key={place.place_id}
              id={`${resolvedInputId}-item-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => handleSelect(place)}
              className={`px-4 py-3 cursor-pointer flex items-center text-sm transition-colors min-h-[44px] ${
                index === activeIndex
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <span className="truncate">{formatAddress(place)}</span>
            </li>
          ))}
          <li className="px-2 py-1 flex justify-end bg-gray-50 sticky bottom-0 border-t border-gray-100">
            <span className="text-[10px] text-gray-400" aria-hidden="true">
              © OpenStreetMap contributors
            </span>
          </li>
        </ul>
      )}

      {error && (
        <div
          id={errorId}
          className="flex items-center mt-1 text-red-500 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
