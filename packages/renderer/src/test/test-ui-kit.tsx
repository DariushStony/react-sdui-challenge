import type { UiKit } from '../ui-kit';
import { fieldIds } from '../ui-kit';

// A design system that has nothing in common with the default kit: plain elements, a marker on each
// one, and none of the default class names. It shows what a host has to implement, and lets a test
// prove the engine renders through the contract and not through the default components.
function mark(name: string) {
  return { 'data-kit': 'test', 'data-part': name };
}

const testUiKit: UiKit = {
  Alert: ({ tone, title, action, ref, children }) => (
    <div ref={ref} tabIndex={-1} role={tone === 'error' ? 'alert' : 'status'} {...mark('alert')}>
      {title ? <strong>{title}</strong> : null}
      <div>{children}</div>
      {action}
    </div>
  ),
  Button: ({ busy, variant: _variant, onClick, children, type = 'button', ...rest }) => (
    <button
      {...rest}
      {...mark('button')}
      type={type}
      aria-disabled={busy ? true : undefined}
      onClick={(event) => (busy ? event.preventDefault() : onClick?.(event))}
    >
      {children}
    </button>
  ),
  Field: ({ id, label, required, description, error, children }) => {
    const ids = fieldIds(id);
    return (
      <div {...mark('field')}>
        <label id={ids.label} htmlFor={id}>
          {label}
          {required ? ' (required)' : ''}
        </label>
        {description ? <small id={ids.description}>{description}</small> : null}
        {children}
        <em id={ids.error} aria-live="polite">
          {error}
        </em>
      </div>
    );
  },
  FileList: ({ items, removeLabel, removeText, onRemove }) => (
    <ol {...mark('file-list')}>
      {items.map((item) => (
        <li key={item.key}>
          {item.name}
          <button
            type="button"
            aria-label={removeLabel(item.name)}
            onClick={() => onRemove(item.key)}
          >
            {removeText}
          </button>
        </li>
      ))}
    </ol>
  ),
  FilePicker: ({ id, labelledBy, buttonLabel, status, accept, multiple, disabled, onFiles }) => (
    <div {...mark('file-picker')}>
      <input
        id={id}
        type="file"
        hidden
        disabled={disabled}
        accept={accept}
        multiple={multiple}
        onChange={(event) => onFiles(Array.from(event.currentTarget.files ?? []))}
      />
      <button
        type="button"
        id={`${id}-button`}
        aria-labelledby={`${labelledBy} ${id}-button`}
        disabled={disabled}
      >
        {buttonLabel}
      </button>
      <p aria-live="polite">{status}</p>
    </div>
  ),
  Form: ({ ...rest }) => <form {...rest} noValidate {...mark('form')} />,
  FormActions: ({ children }) => <div {...mark('actions')}>{children}</div>,
  Select: ({ invalid, size: _size, children, ...rest }) => (
    <select {...rest} {...mark('select')} aria-invalid={invalid ? true : undefined}>
      {children}
    </select>
  ),
  TextArea: ({ invalid, size: _size, ...rest }) => (
    <textarea {...rest} {...mark('textarea')} aria-invalid={invalid ? true : undefined} />
  ),
  TextInput: ({ invalid, size: _size, ...rest }) => (
    <input {...rest} {...mark('text-input')} aria-invalid={invalid ? true : undefined} />
  ),
  VisuallyHidden: ({ children, live }) => (
    <span {...mark('hidden')} aria-live={live ? 'polite' : undefined}>
      {children}
    </span>
  ),
};

export { testUiKit };
