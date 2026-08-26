export function hit(a, b, padding = 8) {
  const A = a.getBoundingClientRect();
  const B = b.getBoundingClientRect();
  return A.left < B.right - padding && A.right > B.left + padding && A.top < B.bottom - padding && A.bottom > B.top + padding;
}
