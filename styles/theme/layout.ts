export const layout = {
  screen: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  content: {
    gap: 12,
  },
  row: {
    gap: 8,
  },
  card: {
    padding: 16,
  },
  chip: {
    paddingH: 12,
    paddingV: 6,
  },
} as const;

export type Layout = typeof layout;
