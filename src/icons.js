const paths = {
  arrow: '<path d="M4 12h15M13 5l7 7-7 7"/>',
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
  bag: '<path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  user: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  alert: '<path d="M12 3 2.8 19h18.4L12 3Z"/><path d="M12 9v4m0 3h.01"/>',
  chevron: '<path d="m7 10 5 5 5-5"/>',
  box: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',
};

export function icon(name, className = '') {
  const path = paths[name] ?? paths.check;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${path}</svg>`;
}
