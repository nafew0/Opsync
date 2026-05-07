/* BdREN OpsSync — Icons (inline SVG components) */

const Icon = ({ d, size = 16, stroke = 1.6, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const Icons = {
  dashboard: (p) => <Icon {...p} d={["M3 13l9-9 9 9", "M5 11v9h5v-6h4v6h5v-9"]} />,
  calendar:  (p) => <Icon {...p} d={["M3 9h18", "M7 3v4", "M17 3v4", "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"]} />,
  food:      (p) => <Icon {...p} d={["M4 21h16", "M4 17h16", "M5 17a7 7 0 0 1 14 0", "M12 7V4", "M9 4h6"]} />,
  box:       (p) => <Icon {...p} d={["M3 7l9-4 9 4-9 4-9-4z", "M3 7v10l9 4 9-4V7", "M12 11v10"]} />,
  car:       (p) => <Icon {...p} d={["M5 17H4a1 1 0 0 1-1-1v-3l2-5h14l2 5v3a1 1 0 0 1-1 1h-1", "M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M5 13h14"]} />,
  receipt:   (p) => <Icon {...p} d={["M5 3h14v18l-3-2-3 2-3-2-3 2-2-2V3z", "M9 8h6", "M9 12h6", "M9 16h4"]} />,
  asset:     (p) => <Icon {...p} d={["M4 7h16v13H4z", "M9 11h6", "M9 15h4", "M8 4h8v3H8z"]} />,
  visitor:   (p) => <Icon {...p} d={["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"]} />,
  reports:   (p) => <Icon {...p} d={["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"]} />,
  settings:  (p) => <Icon {...p} d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"]} />,
  search:    (p) => <Icon {...p} d={["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.35-4.35"]} />,
  bell:      (p) => <Icon {...p} d={["M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9", "M10 21a2 2 0 0 0 4 0"]} />,
  plus:      (p) => <Icon {...p} d={["M12 5v14", "M5 12h14"]} />,
  minus:     (p) => <Icon {...p} d={["M5 12h14"]} />,
  chevron:   (p) => <Icon {...p} d={"M9 18l6-6-6-6"} />,
  print:     (p) => <Icon {...p} d={["M6 9V3h12v6", "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2", "M6 14h12v8H6z"]} />,
  download:  (p) => <Icon {...p} d={["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"]} />,
  trash:     (p) => <Icon {...p} d={["M3 6h18", "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", "M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"]} />,
  clock:     (p) => <Icon {...p} d={["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"]} />,
  pin:       (p) => <Icon {...p} d={["M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z", "M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"]} />,
  user:      (p) => <Icon {...p} d={["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"]} />,
  check:     (p) => <Icon {...p} d={"M5 12l5 5L20 7"} />,
  alert:     (p) => <Icon {...p} d={["M12 9v4", "M12 17h.01", "M10.3 3.86l-8.5 14.7A2 2 0 0 0 3.5 22h17a2 2 0 0 0 1.7-3.44l-8.5-14.7a2 2 0 0 0-3.4 0z"]} />,
  arrowR:    (p) => <Icon {...p} d={["M5 12h14", "M13 6l6 6-6 6"]} />,
  drag:      (p) => <Icon {...p} d={["M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01"]} stroke={3} />,
  monitor:   (p) => <Icon {...p} d={["M3 5h18v12H3z", "M8 21h8", "M12 17v4"]} />,
  whiteboard:(p) => <Icon {...p} d={["M3 4h18v13H3z", "M3 17l9 4 9-4"]} />,
  video:     (p) => <Icon {...p} d={["M3 7h12v10H3z", "M15 11l6-3v8l-6-3"]} />,
  fuel:      (p) => <Icon {...p} d={["M3 22V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v18", "M3 13h10", "M13 8h2a3 3 0 0 1 3 3v6a2 2 0 0 0 4 0V8l-3-3"]} />,
  bangla:    (p) => <Icon {...p} d={["M5 5l5 14", "M14 5h4", "M14 12h3", "M14 19h4"]} />,
  filter:    (p) => <Icon {...p} d={"M3 5h18M6 12h12M10 19h4"} />,
};

window.Icons = Icons;
