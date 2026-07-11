import type { Authentication, Bundle, ZObject } from 'zapier-platform-core';
import { qentrahApiBase } from './config.js';

const test = (z: ZObject, bundle: Bundle) =>
  z.request({ url: `${qentrahApiBase(bundle.authData)}/me` }).then((response) => response.data);

export default {
  type: 'custom',
  fields: [
    {
      key: 'organizationId',
      label: 'Organization ID',
      type: 'string',
      required: true,
      helpText: 'Open [Qentrah organization settings](https://app.qentrah.com/en/settings/general) and copy the organization ID.',
    },
    {
      key: 'apiKey',
      label: 'Organization API Key',
      type: 'password',
      required: true,
      helpText: 'Create an API key in [Qentrah API key settings](https://app.qentrah.com/en/settings/api-keys) with the task, client, and document permissions your Zaps need.',
    },
  ],
  test,
  connectionLabel: '{{organization.name}} ({{organizationId}})',
} satisfies Authentication;
