import type { UiKit } from '../ui-kit';
import { Alert } from './Alert';
import { Button } from './Button';
import { Field } from './Field';
import { FileList } from './FileList';
import { FilePicker } from './FilePicker';
import { Form, FormActions } from './Form';
import { Select } from './Select';
import { TextArea } from './TextArea';
import { TextInput } from './TextInput';
import { VisuallyHidden } from './VisuallyHidden';

/** The library's own design components, gathered as a `UiKit`: what is used when no kit is given. */
export const defaultUiKit: UiKit = {
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
