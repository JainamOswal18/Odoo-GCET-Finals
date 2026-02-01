import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { ChevronDown, Loader2, X } from 'lucide-react';

interface AutocompleteOption {
  id: number | string;
  label: string;
  value: string;
}

interface AutocompleteProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string, option?: AutocompleteOption) => void;
  onSearch: (search: string) => Promise<AutocompleteOption[]>;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  className?: string;
}

export function Autocomplete({
  label,
  placeholder = 'Type to search...',
  value = '',
  onChange,
  onSearch,
  disabled = false,
  error,
  required = false,
  className = '',
}: AutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<AutocompleteOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AutocompleteOption | null>(null);
  
  const debouncedSearch = useDebounce(inputValue, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Search options when debounced value changes
  useEffect(() => {
    if (debouncedSearch) {
      handleSearch(debouncedSearch);
    } else {
      setOptions([]);
    }
  }, [debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSearch = async (search: string) => {
    setIsLoading(true);
    try {
      const results = await onSearch(search);
      setOptions(results);
      setIsOpen(true);
    } catch (error) {
      console.error('Autocomplete search error:', error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedOption(null);
    onChange(newValue);
  };

  const handleOptionSelect = (option: AutocompleteOption) => {
    setInputValue(option.label);
    setSelectedOption(option);
    setIsOpen(false);
    onChange(option.label, option);
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedOption(null);
    setOptions([]);
    onChange('');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => inputValue && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-20 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          )}
          
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionSelect(option)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {isOpen && !isLoading && inputValue && options.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg px-3 py-2 text-gray-500 text-sm">
          No results found
        </div>
      )}
    </div>
  );
}
