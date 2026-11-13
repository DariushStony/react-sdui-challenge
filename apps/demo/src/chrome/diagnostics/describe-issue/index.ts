import { type Issue } from '@dynamic-form/renderer/core';

const describeIssue = (issue: Issue): string => `${issue.path}: ${issue.message}`;

export { describeIssue };
