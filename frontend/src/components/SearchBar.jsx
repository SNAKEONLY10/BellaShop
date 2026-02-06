import React, { useEffect } from 'react';

export default function SearchBar({ onSearch, placeholder = 'Search products...', autoFocus = false }) {
  const [query, setQuery] = React.useState('');

  useEffect(() => {
    if (autoFocus) {
      const input = document.querySelector('.search-input');
      if (input) input.focus();
    }
  }, [autoFocus]);

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className="search-container" data-aos="fade-down" data-aos-duration="600">
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        data-testid="search-input"
      />
      {query && (
        <button
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '1em',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#919499',
            fontSize: '1.2em',
            padding: '0.5em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
