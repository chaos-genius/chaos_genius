import React from 'react';
import './pagination.scss';

const Pagination = ({
  pagination,
  pgInfo,
  handleBtnClick,
  handleSelectClick
}) => {
  let pageBtns = [];

  const per_page_options = [
    {
      value: 10,
      label: '10'
    },
    {
      value: 20,
      label: '20'
    },
    { value: 40, label: '40' },
    { value: 50, label: '50' }
  ];

  const per_page_index = per_page_options.findIndex((option) => {
    return +option.value === +pgInfo?.per_page;
  });

  const per_page =
    per_page_index > -1
      ? per_page_options[per_page_index]
      : per_page_options[0];

  const createRangeWithDots = (c, m) => {
    let current = c,
      last = m,
      delta = 2,
      left = current - delta,
      right = current + delta + 1,
      range = [],
      rangeWithDots = [],
      l;

    for (let i = 1; i <= last; i++) {
      if (+i === 1 || +i === +last || (+i >= +left && +i < +right)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pageArrays = createRangeWithDots(
    Number(pgInfo?.page),
    Number(pagination?.pages)
  );

  pageArrays.forEach((pageItem) => {
    pageBtns.push(
      pageItem === '...' ? (
        '...'
      ) : (
        <button
          className={
            +pageItem === +pgInfo?.page ? 'page-btn active' : 'page-btn'
          }
          onClick={(e) => {
            handleBtnClick(+e.target.innerHTML);
          }}
          key={pageItem}>
          {pageItem}
        </button>
      )
    );
  });

  const handleChevronClick = (direction) => {
    if (direction === 'right') {
      if (+pgInfo?.page < +pagination?.pages) {
        handleBtnClick(+pgInfo?.page + 1);
      }
    } else if (direction === 'left') {
      if (+pgInfo?.page > 1) {
        handleBtnClick(+pgInfo?.page - 1);
      }
    }
  };

  return (
    <div className="pagination-container">
      <div className="pageinfo-container">
        <span>
          {pagination?.first_entry_position} - {pagination?.last_entry_position}{' '}
          of {pagination?.total} items
        </span>
      </div>
      {pagination?.pages && (
        <div className="pgbtns-container">
          <button
            className="button-chevron"
            onClick={() => {
              handleChevronClick('left');
            }}>
            {'<'}
          </button>
          {pageBtns}
          <button
            className="button-chevron"
            onClick={() => {
              handleChevronClick('right');
            }}>
            {'>'}
          </button>
          <div className="select-container">
            <select
              className="per-page-select"
              onChange={handleSelectClick}
              value={per_page.value}>
              {per_page_options.map((option, index) => {
                return (
                  <option key={index} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
