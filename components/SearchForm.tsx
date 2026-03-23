'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchParams } from '@/lib/types';

const AVAILABLE_LANGUAGES = [
  'English', 'German', 'Turkish', 'French', 'Spanish', 'Italian',
  'Portuguese', 'Dutch', 'Polish', 'Russian', 'Arabic', 'Chinese',
];

const POPULAR_TITLES = [
  'Product Manager', 'Product Owner', 'Senior Product Manager',
  'Technical Product Manager', 'Group Product Manager', 'Head of Product',
  'Director of Product', 'VP Product', 'Project Manager', 'Scrum Master',
];

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [title, setTitle] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [location, setLocation] = useState('');
  const [distanceKm, setDistanceKm] = useState(50);
  const [locationSuggestions, setLocationSuggestions] = useState<{ name: string; lat: number; lon: number }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (location.length >= 2) {
        const res = await fetch(`/api/locations?q=${encodeURIComponent(location)}`);
        const data = await res.json();
        setLocationSuggestions(data);
        setShowSuggestions(true);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (titleRef.current && !titleRef.current.contains(e.target as Node)) {
        setShowTitleSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleLanguage = (lang: string) => {
    setLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location) return;
    onSearch({ title, languages, experienceYears, location, distanceKm });
  };

  const filteredTitles = POPULAR_TITLES.filter((t) =>
    t.toLowerCase().includes(title.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Title */}
        <div ref={titleRef} className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Job Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setShowTitleSuggestions(true);
            }}
            onFocus={() => setShowTitleSuggestions(true)}
            placeholder="z.B. Product Manager"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            required
          />
          {showTitleSuggestions && filteredTitles.length > 0 && title.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredTitles.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTitle(t);
                    setShowTitleSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div ref={locationRef} className="relative">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="z.B. Berlin, München, Hamburg"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            required
          />
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {locationSuggestions.map((loc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setLocation(loc.name);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Languages You Speak
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                languages.includes(lang)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Years of Experience: <span className="text-blue-600">{experienceYears}</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={experienceYears}
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0 years</span>
            <span>10 years</span>
            <span>20 years</span>
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Max Distance: <span className="text-blue-600">{distanceKm} km</span>
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="10"
            value={distanceKm}
            onChange={(e) => setDistanceKm(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>10 km</span>
            <span>100 km</span>
            <span>200 km</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !title || !location}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Searching across all platforms...
          </span>
        ) : (
          'Search Jobs'
        )}
      </button>
    </form>
  );
}
