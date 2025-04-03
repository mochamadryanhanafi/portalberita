import { useState, useEffect, useCallback } from 'react';

interface BlogSearchProps {
  onSearch: (searchTerm: string) => void;
}

const BlogSearch = ({ onSearch }: BlogSearchProps) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  // Debounce search term to prevent too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Trigger search when debounced search term changes
  useEffect(() => {
    handleSearch();
  }, [debouncedSearchTerm]);

  const handleSearch = useCallback(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Immediately set debounced term to current search term
      setDebouncedSearchTerm(searchTerm);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Debounced search is handled by useEffect
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-grow">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by blog title..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            className="w-full rounded-lg border border-gray-300 bg-light px-4 py-2 text-light-title focus:border-gray-500 focus:outline-none dark:border-gray-700 dark:bg-dark-card dark:text-dark-title"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {debouncedSearchTerm !== searchTerm ? 'Typing...' : ''}
        </p>
      </div>
    </div>
  );
};

export default BlogSearch;