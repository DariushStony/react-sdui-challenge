// The canonical model: the only representation of a form that the rest of the app reads. Every
// payload shape is converted into this at one boundary (ADR-0001, TDD section 5).

type FieldSize = 'small' | 'medium' | 'large';

export type { FieldSize };
