/*
  Iconos del Border switch — Sharp / Curved / Round. 20×20 viewBox 24×24.
  Replican el shape de los SVG originales de shots.so (square, rounded-rect, circle).
*/

export function SharpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        d="M2 2h20v20H2z"
      />
    </svg>
  );
}

export function CurvedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        d="M6.5 2.75h11A3.75 3.75 0 0 1 21.25 6.5v11a3.75 3.75 0 0 1-3.75 3.75h-11A3.75 3.75 0 0 1 2.75 17.5v-11A3.75 3.75 0 0 1 6.5 2.75Z"
      />
    </svg>
  );
}

export function RoundIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={20} height={20}>
      <circle
        cx={12}
        cy={12}
        r={9.75}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
      />
    </svg>
  );
}
