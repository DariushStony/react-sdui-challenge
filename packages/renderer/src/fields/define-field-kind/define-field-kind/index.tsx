import type { ComponentType } from 'react';
import type { KindDefinition } from '../../../core/kind/kind-definition';
import type { FieldModel } from '../../../core/model/field-model';
import type { FieldComponentProps } from '../../component';
import type { FieldKind } from '../field-kind';

/**
 * Pairs a kind's pure definition with its component, widening the component the same way
 * `defineKind` widens the definition so the registry holds one type. A field of another kind is a
 * programming error and throws instead of being rendered by the wrong component.
 */
function defineFieldKind<F extends FieldModel>(
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

export { defineFieldKind };
