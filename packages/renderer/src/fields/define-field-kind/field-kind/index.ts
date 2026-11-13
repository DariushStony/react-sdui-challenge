import type { FunctionComponent } from 'react';
import type { KindDefinition } from '../../../core/kind/kind-definition';
import type { FieldModel } from '../../../core/model/field-model';
import type { FieldComponentProps } from '../../component';

/** A field kind with its component: what the renderer looks up (ADR-0002). */
type FieldKind = {
  readonly definition: KindDefinition;
  readonly Component: FunctionComponent<FieldComponentProps<FieldModel>>;
};

export type { FieldKind };
