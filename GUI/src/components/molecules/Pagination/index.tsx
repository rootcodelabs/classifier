import React from 'react';
import { Link } from 'react-router-dom';
import { MdOutlineWest, MdOutlineEast } from 'react-icons/md';
import clsx from 'clsx';
import "./Pagination.scss"
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  pageCount: number;
  pageSize: number;
  pageIndex: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  id?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  pageCount,
  pageSize,
  pageIndex,
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  id,
}) => {
    const { t } = useTranslation();

  return (
    <div className='data-table__pagination-wrapper'>
      {(pageCount * pageSize) > pageSize && (
        <div className='data-table__pagination'>
          <button
            className='previous'
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPreviousPage}
          >
            <MdOutlineWest />
          </button>
          <nav role='navigation' aria-label={t('global.paginationNavigation') ?? ''}>
            <ul className='links'>
              {[...Array(pageCount)].map((_, index) => (
                <li
                  key={`${id}-${index}`}
                  className={clsx({ 'active': pageIndex === index })}
                >
                  <Link
                    to={`?page=${index + 1}`}
                    onClick={() => onPageChange(index)}
                    aria-label={`${t('global.gotoPage')} ${index + 1}`}
                    aria-current={pageIndex === index ? 'page' : undefined}
                  >
                    {index + 1}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className='next'
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNextPage}
          >
            <MdOutlineEast />
          </button>
        </div>
      )}
      <div className='data-table__page-size'>
        <label htmlFor={id}>{t('global.resultCount')}</label>
        <select
          id={id}
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50].map(size => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Pagination;
