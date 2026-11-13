import { useRef } from 'react';
import { addFiles } from '../../../core/file-list/add-files';
import { fileKey } from '../../../core/file-list/file-key';
import { removeFile } from '../../../core/file-list/remove-file';
import type { FileField } from '../../../core/model/file-field';
import { useMessages } from '../../../provider/use-messages';
import { useUiKit } from '../../../provider/use-ui-kit';
import { fieldIds } from '../../../ui-kit/field-ids';
import type { FieldComponentProps } from '../../component';
import { FieldFrame } from '../../field-frame/field-frame';
import { useObjectUrls } from '../use-object-urls';

// One shared empty list: a new `[]` on every render would look like a change to the effect that
// manages thumbnail addresses and loop.
const NO_FILES: File[] = [];

const isText = (part: string | undefined): part is string => part !== undefined;

function FileComponent({
  field,
  id,
  value,
  onChange,
  onBlur,
  errors,
  inputRef,
}: FieldComponentProps<FileField>) {
  const { FileList, FilePicker } = useUiKit();
  const { t, formatBytes } = useMessages();
  const files = Array.isArray(value) ? value : NO_FILES;
  const urls = useObjectUrls(files);
  const pickerRef = useRef<HTMLButtonElement | null>(null);

  // A choice or a removal is a finished interaction, so the field reports a blur straight away and
  // the form can check the files at once instead of waiting for the person to tab away.
  const change = (next: File[]) => {
    onChange(next);
    onBlur();
  };

  const { accept, maxBytes, maxFiles } = field.rules;
  const limit = field.multiple ? maxFiles : undefined;
  // A button cannot carry aria-required, so "required" and the limits are said in the description.
  const hint = [
    field.required ? t('required_hint') : undefined,
    field.description,
    accept && accept.length > 0 ? t('files_accept', { accept: accept.join(', ') }) : undefined,
    maxBytes !== undefined ? t('files_max_size', { maxBytes }) : undefined,
    limit !== undefined ? t('files_max_count', { max: limit }) : undefined,
  ]
    .filter(isText)
    .join(' ');

  const items = files.map((file) => {
    const key = fileKey(file);
    return {
      key,
      name: file.name,
      sizeLabel: formatBytes(file.size),
      previewUrl: urls.get(key),
      invalid: errors.some((error) => error.params?.['file'] === file.name),
    };
  });

  return (
    <FieldFrame field={field} id={id} errors={errors} hint={hint === '' ? undefined : hint}>
      {(control) => {
        const locked = control.disabled === true || control.readOnly === true;
        return (
          <>
            <FilePicker
              id={id}
              labelledBy={fieldIds(id).label}
              buttonLabel={t(field.multiple ? 'choose_files' : 'choose_file')}
              status={
                files.length === 0 ? t('files_none') : t('files_count', { count: files.length })
              }
              accept={accept && accept.length > 0 ? accept.join(',') : undefined}
              multiple={field.multiple}
              disabled={locked}
              describedBy={control['aria-describedby']}
              buttonRef={(element) => {
                pickerRef.current = element;
                inputRef(element);
              }}
              onFiles={(incoming) => {
                // The input is disabled too; this covers an event that reaches it anyway.
                if (locked) return;
                change(field.multiple ? addFiles(files, incoming) : incoming.slice(0, 1));
              }}
            />
            <FileList
              items={items}
              removeLabel={(name) => t('remove_file_label', { file: name })}
              removeText={t('remove_file')}
              disabled={locked}
              onRemove={(key) => {
                change(removeFile(files, key));
                // The removed row's button is gone; send focus somewhere sensible instead of the page.
                pickerRef.current?.focus();
              }}
            />
          </>
        );
      }}
    </FieldFrame>
  );
}

export { FileComponent };
