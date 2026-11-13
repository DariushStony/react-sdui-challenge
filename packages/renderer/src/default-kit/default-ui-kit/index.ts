import type { UiKit } from '../../ui-kit/ui-kit';
import { Alert } from '../alert';
import { Button } from '../button';
import { Field } from '../field';
import { FileList } from '../file-list';
import { FilePicker } from '../file-picker';
import { Form } from '../form/form';
import { FormActions } from '../form/form-actions';
import { Select } from '../select';
import { TextArea } from '../text-area';
import { TextInput } from '../text-input';
import { VisuallyHidden } from '../visually-hidden';

/** The library's own design components, gathered as a `UiKit`: what is used when no kit is given. */
const defaultUiKit: UiKit = {
  Alert,
  Button,
  Field,
  FileList,
  FilePicker,
  Form,
  FormActions,
  Select,
  TextArea,
  TextInput,
  VisuallyHidden,
};

export { defaultUiKit };
