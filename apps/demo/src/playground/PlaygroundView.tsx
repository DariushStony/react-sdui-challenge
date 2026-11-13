import { useEffect, useId, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DynamicForm,
  FIELD_DEFINITIONS,
  Field,
  Page,
  RejectionAlert,
  Section,
  Select,
  TechnicalDetails,
  TextArea,
  WarningsAlert,
  describedBy,
  getDirection,
  normalize,
  setDocumentDirection,
  t,
} from '@dynamic-form/renderer';
import { analyzeInput } from './diagnostics';
import { createDryRun } from './dry-run';
import { PRESETS, presetText, type DryRunResult } from './presets';

const RESULTS: readonly { value: DryRunResult; labelKey: string }[] = [
  { value: 'success', labelKey: 'result_success' },
  { value: 'validation', labelKey: 'result_validation' },
  { value: 'network', labelKey: 'result_network' },
];

const first = PRESETS[0]!;

/**
 * Paste or pick a form description and see the real renderer react to it. There is no rendering or
 * validation logic here (FR-37): the text goes through `normalize`, the model goes to `DynamicForm`,
 * and submitting shows the request instead of sending it (ADR-0013).
 */
export function PlaygroundView() {
  const uid = useId();
  const [presetId, setPresetId] = useState(first.id);
  const [text, setText] = useState(() => presetText(first));
  const [result, setResult] = useState<DryRunResult>(first.result);
  const [ltr, setLtr] = useState(false);

  const analysis = useMemo(() => analyzeInput(text, normalize), [text]);
  const model = analysis.type === 'parsed' && analysis.result.ok ? analysis.result.model : null;
  const dryRun = useMemo(
    () => (model === null ? null : createDryRun({ model, definitions: FIELD_DEFINITIONS, result })),
    [model, result],
  );

  // Flipping the direction is part of the demonstration (FR-39); leaving the view puts it back.
  useEffect(() => {
    if (!ltr) return;
    const before = getDirection();
    setDocumentDirection('ltr');
    return () => setDocumentDirection(before);
  }, [ltr]);

  const choose = (id: string) => {
    const preset = PRESETS.find((candidate) => candidate.id === id);
    if (preset === undefined) return;
    setPresetId(preset.id);
    setText(presetText(preset));
    setResult(preset.result);
  };

  const ids = { preset: `${uid}-preset`, json: `${uid}-json`, result: `${uid}-result` };

  let diagnostics;
  if (analysis.type === 'empty') {
    diagnostics = <Alert tone="info">{t('json_empty')}</Alert>;
  } else if (analysis.type === 'invalid-json') {
    diagnostics = (
      <Alert tone="error" title={t('json_invalid_title')}>
        <p>{t('json_invalid')}</p>
        <TechnicalDetails lines={[analysis.message]} />
      </Alert>
    );
  } else if (!analysis.result.ok) {
    diagnostics = (
      <RejectionAlert reason={analysis.result.reason} issues={analysis.result.issues} />
    );
  } else {
    diagnostics =
      analysis.result.warnings.length > 0 ? (
        <WarningsAlert warnings={analysis.result.warnings} />
      ) : (
        <p>{t('playground_valid')}</p>
      );
  }

  return (
    <Page title={t('playground_title')}>
      <Section title={t('playground_editor')}>
        <Field id={ids.preset} label={t('playground_preset')}>
          <Select id={ids.preset} value={presetId} onChange={(event) => choose(event.target.value)}>
            {PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {t(preset.labelKey)}
              </option>
            ))}
          </Select>
        </Field>
        <Field id={ids.json} label={t('playground_json')} description={t('playground_json_hint')}>
          <TextArea
            id={ids.json}
            dir="ltr"
            rows={16}
            spellCheck={false}
            value={text}
            aria-describedby={describedBy(ids.json, { description: true, error: false })}
            onChange={(event) => setText(event.target.value)}
          />
        </Field>
        <Field id={ids.result} label={t('playground_result')}>
          <Select
            id={ids.result}
            value={result}
            onChange={(event) => setResult(event.target.value as DryRunResult)}
          >
            {RESULTS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </Select>
        </Field>
      </Section>

      <Section title={t('playground_diagnostics')}>{diagnostics}</Section>

      <Section title={t('playground_preview')}>
        <div>
          <Button variant="secondary" aria-pressed={ltr} onClick={() => setLtr((value) => !value)}>
            {t('playground_direction')}
          </Button>
        </div>
        {model !== null && dryRun !== null ? (
          <DynamicForm model={model} onSubmit={dryRun} />
        ) : (
          <p>{t('playground_no_preview')}</p>
        )}
      </Section>
    </Page>
  );
}
