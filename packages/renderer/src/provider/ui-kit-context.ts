import { createContext } from 'react';
import { defaultUiKit } from '../default-kit';
import type { UiKit } from '../ui-kit';

// The default is the library's own kit, so a form works with no provider. This module and the
// message context are the only places that name a concrete kit or catalog (ADR-0015).
const UiKitContext = createContext<UiKit>(defaultUiKit);

export { UiKitContext };
