// The contract between the renderer and a design system (ADR-0015). The engine and the field
// components render through these props only; any kit that implements them can replace the default.

/** The size tokens a control understands. The form engine maps a server size hint onto these. */
type ControlSize = 'small' | 'medium' | 'large';

export type { ControlSize };
