import { type Issue } from '@dynamic-form/renderer';

const describeIssue = (issue: Issue): string => `${issue.path}: ${issue.message}`;

export { describeIssue };
