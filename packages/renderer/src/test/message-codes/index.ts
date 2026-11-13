/**
 * Every stable message code a validation rule can report (docs/api-contract.md, section 6.1).
 * Codes are data: the client turns them into Persian text, the server sends the same codes. `invalid`
 * is the generic code for a value that failed in a way no rule names.
 */
const MESSAGE_CODES = [
  'required',
  'too_short',
  'too_long',
  'pattern_mismatch',
  'not_a_number',
  'too_small',
  'too_big',
  'not_an_integer',
  'not_an_option',
  'file_type',
  'file_too_large',
  'too_many_files',
  'invalid',
] as const;

export { MESSAGE_CODES };
