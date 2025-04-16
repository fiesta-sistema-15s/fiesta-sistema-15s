import React from 'react';
import '../styles/AdminPanel.css';

function Pagination({ currentPage, totalPages, goToPage }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button onClick={() => goToPage(1)} disabled={currentPage === 1} className="pagination-btn">
        &laquo; Primera
      </button>
      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">
        &lt; Anterior
      </button>
      <span className="pagination-info">Página {currentPage} de {totalPages}</span>
      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">
        Siguiente &gt;
      </button>
      <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages} className="pagination-btn">
        Última &raquo;
      </button>
    </div>
  );
}

export default Pagination;
