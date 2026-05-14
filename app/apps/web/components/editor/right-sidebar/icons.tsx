/*
  Iconos del LayoutFilters switch — Single / Double / Triple.
  Paths copiados verbatim del DOM de shots.so (scrap.html).
*/

export function SingleLayoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <path
        fill="currentColor"
        d="M13.997 2A3.004 3.004 0 0 1 17 5.012v13.976A3 3 0 0 1 13.997 22h-3.995A3.005 3.005 0 0 1 7 18.988V5.012A3.01 3.01 0 0 1 10.002 2z"
      />
    </svg>
  );
}

export function DoubleLayoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <g fill="currentColor">
        <path d="M8.098 4A2.404 2.404 0 0 1 10.5 6.41v11.18A2.4 2.4 0 0 1 8.098 20H4.901A2.404 2.404 0 0 1 2.5 17.59V6.41A2.41 2.41 0 0 1 4.901 4zM19.098 4A2.404 2.404 0 0 1 21.5 6.41v11.18A2.4 2.4 0 0 1 19.098 20h-3.197a2.404 2.404 0 0 1-2.401-2.41V6.41A2.41 2.41 0 0 1 15.901 4z" />
      </g>
    </svg>
  );
}

export function TripleLayoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <g fill="currentColor">
        <path d="M5.548 6.5c1.083 0 1.952.879 1.952 1.958v9.084A1.95 1.95 0 0 1 5.548 19.5H2.951A1.953 1.953 0 0 1 1 17.542V8.458C1 7.379 1.875 6.5 2.951 6.5zM13.298 6.5c1.083 0 1.952.879 1.952 1.958v9.084a1.95 1.95 0 0 1-1.952 1.958h-2.597a1.953 1.953 0 0 1-1.951-1.958V8.458c0-1.079.875-1.958 1.951-1.958zM21.048 6.5C22.131 6.5 23 7.379 23 8.458v9.084a1.95 1.95 0 0 1-1.952 1.958h-2.597a1.953 1.953 0 0 1-1.951-1.958V8.458c0-1.079.875-1.958 1.951-1.958z" />
      </g>
    </svg>
  );
}
