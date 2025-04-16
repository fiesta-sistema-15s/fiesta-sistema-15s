import React from 'react';
import '../styles/AdminPanel.css';

function SearchBar({ searchTerm, onChange, onClear }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Buscar invitado por nombre..."
        value={searchTerm}
        onChange={onChange}
      />
      {searchTerm && (
        <button onClick={onClear} className="clear-search-btn">Limpiar</button>
      )}
    </div>
  );
}

export default SearchBar;
