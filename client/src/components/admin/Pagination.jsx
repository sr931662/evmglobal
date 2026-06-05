import styles from './Pagination.module.css'

export default function Pagination({ page, totalPages, total, showing, onPage, label = 'items' }) {
  if (!totalPages || totalPages <= 1) return null

  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
  const pageButtons = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => startPage + i)

  return (
    <div className={styles.bar}>
      <p className={styles.info}>
        Showing {showing} of {total} {label}
      </p>
      <div className={styles.btns}>
        <button
          onClick={() => onPage(p => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={styles.pageBtn}
        >
          ‹
        </button>
        {pageButtons.map(p => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPage(p => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={styles.pageBtn}
        >
          ›
        </button>
      </div>
    </div>
  )
}
