'use client';

import { useState, useEffect, useRef } from 'react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: {
    country?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: 'country' | 'city' | 'any';
  className?: string;
  disabled?: boolean;
}

/**
 * LocationAutocomplete Component
 * Uses OpenStreetMap's Nominatim API (free, open-source, global coverage)
 * 
 * Features:
 * - Real-time location search
 * - Debounced API calls
 * - Dropdown suggestions
 * - Type-specific filtering (country/city)
 */
export default function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  type = 'any',
  className = '',
  disabled = false
}: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions from Nominatim API
  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Build Nominatim API query
      let apiUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&q=${encodeURIComponent(searchQuery)}`;
      
      // Add type-specific parameters
      if (type === 'country') {
        apiUrl += '&featuretype=country';
      } else if (type === 'city') {
        apiUrl += '&featuretype=city';
      }

      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'HeyProData-App', // Required by Nominatim
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }

      const data: LocationSuggestion[] = await response.json();
      
      // Filter results based on type
      let filteredData = data;
      if (type === 'country') {
        filteredData = data.filter(item => 
          item.type === 'administrative' && 
          item.address?.country
        );
      } else if (type === 'city') {
        filteredData = data.filter(item => 
          item.address?.city || 
          item.address?.town || 
          item.address?.village
        );
      }

      setSuggestions(filteredData);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for API call (500ms delay)
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    let selectedValue = '';

    if (type === 'country') {
      selectedValue = suggestion.address?.country || suggestion.display_name;
    } else if (type === 'city') {
      selectedValue = suggestion.address?.city || 
                     suggestion.address?.town || 
                     suggestion.address?.village || 
                     suggestion.display_name.split(',')[0];
    } else {
      selectedValue = suggestion.display_name.split(',')[0];
    }

    onChange(selectedValue);
    setShowDropdown(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Format display name for better readability
  const formatDisplayName = (suggestion: LocationSuggestion): string => {
    if (type === 'country') {
      return suggestion.address?.country || suggestion.display_name;
    } else if (type === 'city') {
      const city = suggestion.address?.city || 
                   suggestion.address?.town || 
                   suggestion.address?.village;
      const country = suggestion.address?.country;
      return city && country ? `${city}, ${country}` : suggestion.display_name;
    }
    return suggestion.display_name;
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowDropdown(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        autoComplete="off"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-[#FA6E80] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.lat}-${suggestion.lon}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === highlightedIndex
                  ? 'bg-[#FA6E80] text-white'
                  : 'hover:bg-gray-100 text-black'
              }`}
            >
              <div className="font-medium">
                {formatDisplayName(suggestion)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4">
          <p className="text-gray-500 text-sm text-center">
            No locations found. Try a different search.
          </p>
        </div>
      )}
    </div>
  );
}
