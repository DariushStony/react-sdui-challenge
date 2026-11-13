import { useContext } from 'react';
import type { UiKit } from '../../ui-kit/ui-kit';
import { UiKitContext } from '../ui-kit-context';

/** The design components to render with: the host's kit, or the default one. */
function useUiKit(): UiKit {
  return useContext(UiKitContext);
}

export { useUiKit };
