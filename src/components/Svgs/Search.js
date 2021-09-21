import React from "react";

function Search(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 30 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="13.75"
        cy="13.75"
        r="8.75"
        stroke="currentColor"
        stroke-width="2"
      />
      <path
        d="M25 25L21.25 21.25"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </svg>
  );
}

export default Search;
