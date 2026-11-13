import type { ComponentType, FunctionComponent } from 'react';
import type { KindDefinition } from '../core/kind';
import type { FieldModel } from '../core/model';
import type { FieldComponentProps } from './component';

/** A field kind with its component: what the renderer looks up (ADR-0002). */
export type FieldKind = {
  readonly definition: KindDefinition;
  readonly Component: FunctionComponent<FieldComponentProps<FieldModel>>;
};

/**
 * Pairs a kind's pure definition with its component, widening the component the same way
 * `defineKind` widens the definition so the registry holds one type. A field of another kind is a
 * programming error and throws instead of being rendered by the wrong component.
 */
export function defineFieldKind<F extends FieldModel>(
  kind: F['kind'],
  definition: KindDefinition,
  Component: ComponentType<FieldComponentProps<F>>,
): FieldKind {
  const owns = (field: FieldModel): field is F => field.kind === kind;

  function WidenedComponent(props: FieldComponentProps<FieldModel>) {
    const { field } = props;
    if (!owns(field)) {
      throw new Error(
        `Field "${field.name}" is a ${field.kind} field, but this component renders ${kind}.`,
      );
    }
    return <Component {...props} field={field} />;
  }

  return { definition, Component: WidenedComponent };
}
