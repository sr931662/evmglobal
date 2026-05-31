export default function Pagination({ page, totalPages, total, showing, onPage, label = 'items' }) {
  if (!totalPages || totalPages <= 1) return null

  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pageButtons = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => startPage + i)

  return (
    <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
      <p className="text-sm text-gray-400 font-bold">
        Showing {showing} of {total} {label}
      </p>
      <div className="flex gap-1">
        <button
          onClick={() => onPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          ‹
        </button>
        {pageButtons.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
              p === page ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  )
}
