/** Why a payload was refused. Each reason has its own message in the UI (ADR-0011). */
type RejectionReason = 'invalid' | 'outdated' | 'unknown-required-kind' | 'duplicate-name';

export type { RejectionReason };
