# API contract: Dynamic Form Renderer

| | |
| --- | --- |
| Status | Approved |
| Version | 0.1 |
| Date | 2026-11-13 |
| Owner | Dariush Hadipour |
| Inputs | [prd.md](prd.md) v0.2, [tdd.md](tdd.md) v0.1, the challenge brief's sample response |
| Structure based on | OpenAPI 3.1 conventions (paths, parameters, request bodies, responses, schemas); examples are normative where they say so |
| Companion documents | [adr/0001](adr/0001-canonical-model-and-normalizer.md), [adr/0006](adr/0006-single-multipart-submission.md), [adr/0011](adr/0011-unknown-kinds-and-versioning.md) |

---

## 0. Version history

| Version | Date | Change |
| --- | --- | --- |
| 0.1 | 2026-11-13 | First draft. |

## 1. Status of this contract

The backend is being built at the same time, so **this contract is an assumption, not an agreement**. The client accepts two shapes (PRD FR-04): the **legacy** shape in the challenge brief, which is fixed, and a **v2** shape defined here, which is ours to propose. The mock server implements both. All knowledge of either shape lives in `core/normalize` and `api/` (ADR-0001); if the real contract differs, only those places and this document change.

## 2. Conventions

| Topic | Rule |
| --- | --- |
| Base path | `/api` |
| Path parameter | `formId`: string, URL-safe, identifies a form definition |
| Encoding | `GET` responses are `application/json; charset=utf-8`; the submission request is `multipart/form-data`; error bodies are `application/json` |
| Client headers | The client never sets `Content-Type` on the multipart request, so the browser adds the boundary |
| Field name | `name` is unique within a form and is also the multipart part name |
| Sizes | Legacy: strings such as `"5MB"` (1 MB = 1024 x 1024 bytes). v2: integers in bytes |
| Language | Labels and option texts are Persian data from the server; error wording is owned by the client (section 6.3) |

## 3. `GET /api/forms/{formId}`

Returns the form definition.

| Status | Meaning | Client behavior |
| --- | --- | --- |
| 200 | A legacy or v2 payload | Parse (section 3.1 or 3.2) |
| 404 | Unknown form | Load error state with Retry |
| other 4xx, 5xx, network error | Failure | Load error state with Retry |

A 200 whose body is not valid JSON, or whose structure is wrong, is a **rejected payload**, shown as its own state (PRD FR-07).

### 3.1 Legacy payload (given by the brief; not negotiable)

Recognized by the absence of `schemaVersion`. Trimmed example (the full sample in the brief works unchanged):

```json
{
  "fields": [
    {
      "label": "برند:", "name": "brand", "type": "input",
      "props": { "color": "#000000", "placeholder": "برند ماشین را وارد کنید", "size": "large", "type": "text" },
      "style": { "borderRadius": "5px", "margin": "10px 0", "padding": "8px" }
    },
    {
      "label": "سال ساخت:", "name": "year", "type": "input",
      "props": { "max": "2024", "min": "1900", "placeholder": "سال ساخت را وارد کنید", "type": "number" }
    },
    {
      "label": "نوع سوخت:", "name": "fuel_type", "type": "select",
      "props": { "options": [{ "label": "بنزین", "value": "بنزین" }, { "label": "گاز", "value": "گاز" }] }
    },
    {
      "label": "توضیحات وضعیت فنی:", "name": "technical_condition", "type": "textarea",
      "props": { "cols": 50, "rows": 4, "placeholder": "توضیحات درباره وضعیت فنی ماشین" }
    },
    {
      "label": "تصاویر ماشین:", "name": "car_images", "type": "file",
      "props": { "accept": "image/*", "maxSize": "5MB", "multiple": true }
    }
  ]
}
```

Legacy to canonical mapping (implemented in the normalizer, tested table-driven):

| Legacy | Canonical | Notes |
| --- | --- | --- |
| `type: "input"` with `props.type` `"text"` or missing | kind `text` | |
| `type: "input"` with `props.type` `"number"` | kind `number` | |
| `type: "input"` with another `props.type` (for example `email`) | kind `text` | development warning (EC-14) |
| `type: "textarea"`, `"select"`, `"file"` | same kind | |
| any other `type` | unknown kind | skipped with a warning; legacy fields are never "required" by default, so this never rejects the form (ADR-0011) |
| `label` | `label` | one trailing `:` or `：` removed |
| `name` | `name` | must be unique |
| `props.placeholder` | `placeholder` | |
| `props.min`, `props.max` (strings) | `rules.min`, `rules.max` (numbers) on `number` | non-numeric value makes the payload invalid |
| `props.options[]` | `options[]` | `{label, value}` strings |
| `props.accept` (string, comma separated) | `rules.accept` (array) | |
| `props.maxSize` (`"5MB"`) | `rules.maxBytes` (bytes) | malformed value: rule dropped, warning (EC-04) |
| `props.multiple` | `multiple` | absent means `false` (EC-05) |
| `required` or `props.required`, if present | `required` | optional tolerance; the brief's sample has neither, so its fields are optional |
| `props.size` equal to `small`, `medium` or `large` | `size` token | anything else dropped |
| `props.color`, `style`, `props.rows`, `props.cols` | dropped | presentation belongs to the design system (FR-14) |

### 3.2 v2 payload (proposed)

Recognized by `schemaVersion: 2`.

```json
{
  "schemaVersion": 2,
  "formId": "car-v2",
  "title": "ثبت آگهی خودرو",
  "fields": [
    { "kind": "text", "name": "brand", "label": "برند", "placeholder": "برند ماشین را وارد کنید",
      "rules": { "required": true, "maxLength": 40 } },
    { "kind": "number", "name": "year", "label": "سال ساخت",
      "rules": { "required": true, "min": 1900, "max": 2024, "integer": true } },
    { "kind": "select", "name": "fuel_type", "label": "نوع سوخت",
      "options": [{ "value": "petrol", "label": "بنزین" }, { "value": "gas", "label": "گاز" }],
      "rules": { "required": true } },
    { "kind": "textarea", "name": "technical_condition", "label": "توضیحات وضعیت فنی",
      "description": "حداکثر ۵۰۰ نویسه", "rules": { "maxLength": 500 } },
    { "kind": "file", "name": "car_images", "label": "تصاویر ماشین", "multiple": true,
      "rules": { "accept": ["image/*"], "maxBytes": 5242880, "maxFiles": 5 } }
  ]
}
```

Field properties:

| Property | Type | Applies to | Required | Meaning |
| --- | --- | --- | --- | --- |
| `kind` | `"text" \| "number" \| "textarea" \| "select" \| "file"` | all | yes | Field kind; an unknown value triggers the policy in ADR-0011 |
| `name` | string | all | yes | Unique key; also the multipart part name |
| `label` | string | all | yes | Visible label |
| `description` | string | all | no | Hint shown with the field |
| `placeholder` | string | text, number, textarea | no | |
| `defaultValue` | string | text, number, textarea, select | no | Initial value |
| `disabled`, `readOnly` | boolean | all | no | Default `false` |
| `size` | `"small" \| "medium" \| "large"` | text, number, textarea, select | no | Design-token hint, not CSS |
| `options` | `{ value: string, label: string }[]` | select | yes for select | Static options |
| `multiple` | boolean | file | no | Default `false` |
| `rules` | object | all | no | Table below |

Rules (unknown keys are ignored with a warning):

| Key | Type | Applies to | Message code | Notes |
| --- | --- | --- | --- | --- |
| `required` | boolean | all | `required` | For `file`: at least one file |
| `minLength`, `maxLength` | integer | text, textarea | `too_short`, `too_long` | |
| `pattern` | string (regular expression) | text, textarea | `pattern_mismatch` | A pattern that does not compile is ignored with a warning |
| `min`, `max` | number | number | `too_small`, `too_big` | |
| `integer` | boolean | number | `not_an_integer` | Absent: decimals allowed |
| `accept` | string[] | file | `file_type` | MIME type, `type/*` wildcard, or `.ext` |
| `maxBytes` | integer | file | `file_too_large` | Per file |
| `maxFiles` | integer | file | `too_many_files` | Only with `multiple: true` |

Select membership is always checked (`not_an_option`). The checks above are advisory in the browser; the server validates again and wins.

### 3.3 Version rules

| Payload | Result |
| --- | --- |
| no `schemaVersion` | legacy (version 1) |
| `schemaVersion: 2` | v2 |
| `schemaVersion` greater than the highest supported major | rejected as "client is outdated" |
| unknown optional properties or rule keys | ignored, with a warning |

## 4. `POST /api/forms/{formId}/submissions`

Sends the completed form in one `multipart/form-data` request (ADR-0006).

### 4.1 Request encoding

| Field kind | Parts sent |
| --- | --- |
| `text`, `textarea`, `select` | one text part named `name`, value as typed (trimmed for `text` and `textarea`); an empty field sends an empty string |
| `number` | one text part named `name`, the normalized ASCII number string (for example `۱۳۹۸` is sent as `1398`); empty sends an empty string |
| `file` | one file part named `name` per file, in selection order, using the repeated-key convention; no files means no part |

Example (boundary shortened):

```
POST /api/forms/car-v2/submissions HTTP/1.1
Content-Type: multipart/form-data; boundary=----X

------X
Content-Disposition: form-data; name="brand"

پژو
------X
Content-Disposition: form-data; name="year"

1398
------X
Content-Disposition: form-data; name="fuel_type"

petrol
------X
Content-Disposition: form-data; name="technical_condition"


------X
Content-Disposition: form-data; name="car_images"; filename="front.jpg"
Content-Type: image/jpeg

<bytes>
------X
Content-Disposition: form-data; name="car_images"; filename="rear.jpg"
Content-Type: image/jpeg

<bytes>
------X--
```

### 4.2 Responses

| Status | Meaning | Client behavior |
| --- | --- | --- |
| 201 (any 2xx) | Created | Success panel |
| 422 | Validation failed | Map errors to fields (section 4.3) |
| other statuses, network error | Failure | Form-level alert with Retry, data kept |

Success body (informational; the client does not depend on it):

```json
{ "id": "sub_01", "receivedAt": "2026-11-13T09:30:00Z", "files": [{ "name": "front.jpg", "size": 204800 }] }
```

### 4.3 Validation error body (422)

```json
{
  "errors": {
    "brand": [{ "code": "too_long", "params": { "max": 40 } }],
    "car_images": [{ "code": "file_too_large", "params": { "file": "front.jpg", "maxBytes": 5242880 }, "message": "حجم فایل زیاد است" }]
  },
  "formErrors": [{ "code": "form_closed" }]
}
```

| Property | Type | Meaning |
| --- | --- | --- |
| `errors` | object | Keys are field names; each value is a list of errors |
| `errors[name][].code` | string | Stable message code (section 6.3) |
| `errors[name][].params` | object, optional | Values used inside the message text |
| `errors[name][].message` | string, optional | Fallback text, used only when the client has no text for the code |
| `formErrors` | list, optional | Errors not tied to a field |

A key in `errors` that does not match a field is shown in the form-level alert (PRD FR-33).

## 5. Mock server behavior

The mock (MSW handlers) implements both endpoints with real server-side rules so every client path is reachable. Fixtures double as Playground presets.

| `formId` | Served payload | Purpose |
| --- | --- | --- |
| `car` | the legacy sample from the brief | Legacy path (AC-01) |
| `car-v2` | the v2 example above | v2 path (AC-02) |
| `unknown-optional` | v2 with an unknown optional kind | AC-04 |
| `unknown-required` | v2 with an unknown required kind | AC-04 |
| `outdated` | `schemaVersion: 3` | AC-03 |
| `broken` | 200 with a body that is not valid JSON structure | FR-07 |
| `missing` | 404 | AC-05 |
| `flaky-load` | 500 on the first `GET`, then the `car` payload | AC-05 retry |
| `flaky-submit` | the `car` payload | AC-16 (submit fails once, then works) |
| `closed` | the `car` payload | form-level error on submit (FR-33) |

Submission behavior in the mock:

| Condition | Response |
| --- | --- |
| Any `formId` and all fields valid | 201 with the success body |
| Text field `brand` equals `bad` | 422 with `brand_not_allowed` on `brand`, including a Persian fallback `message` (the client has no catalog text for this code) |
| A required field missing or a rule violated | 422 with the matching codes |
| An unknown field name is sent | 422 with that name in `errors` (exercises the form-level alert) |
| `formId` is `flaky-submit` | 500 on the first `POST`, 201 afterwards |
| `formId` is `closed` | 422 with a `form_closed` entry in `formErrors` |

## 6. Message codes

### 6.1 Rule codes (client and server)

`required`, `too_short`, `too_long`, `pattern_mismatch`, `not_a_number`, `too_small`, `too_big`, `not_an_integer`, `not_an_option`, `file_type`, `file_too_large`, `too_many_files`.

### 6.2 Server-only codes

`brand_not_allowed` (mock example), `form_closed`. Any code without a Persian message in the client catalog falls back to the server's `message`, then to a generic message.

### 6.3 Ownership of text

The client owns Persian wording and parameter formatting (sizes, counts, numbers use locale formatting). The server owns codes. A missing catalog entry is a development warning, never a crash.

## 7. Open points to agree with the backend team

| ID | Question | Current assumption |
| --- | --- | --- |
| O-1 | Can the real API state `required` for legacy payloads? | No; legacy fields are optional |
| O-2 | Is v2 acceptable, or is there a different explicit shape? | v2 as written here |
| O-3 | Does the real API return `422` with this error body? | Yes |
| O-4 | Request size limit and the status for oversized bodies (`413`)? | Treated like any other failure: banner with Retry |
| O-5 | Are select option values always strings? | Yes |
