import { v2CarPayload } from '../../v2-car';

// Each payload below exists to reach one client path (docs/api-contract.md, section 5). They are
// built from the v2 car form so a difference between two scenarios is only the thing under test.
const v2Fields = (v2CarPayload as { fields: readonly unknown[] }).fields;

export { v2Fields };
