import type { NextApiRequest, NextApiResponse } from 'next';
import { Storage } from '@google-cloud/storage';

// This API route sets IAM on the bucket so that all objects are publicly readable.
// Requires a service account with storage.buckets.getIamPolicy and setIamPolicy permissions
// (e.g., roles/storage.admin) configured via GOOGLE_APPLICATION_CREDENTIALS or workload identity.

const BUCKET_NAME = 'pub-coastal-game-files';

type ApiResponse = {
  ok: boolean;
  bucket: string;
  message?: string;
  details?: unknown;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, bucket: BUCKET_NAME, message: 'Method Not Allowed' });
  }

  try {
    const storage = new Storage();
    const bucket = storage.bucket(BUCKET_NAME);

    // Get current IAM policy (v3 supports conditions; we don't add any)
    const [policy] = await bucket.iam.getPolicy({ requestedPolicyVersion: 3 });

    const role = 'roles/storage.objectViewer';
    const member = 'allUsers';

    const existingBindingIndex = policy.bindings.findIndex(b => b.role === role);
    if (existingBindingIndex === -1) {
      policy.bindings.push({ role, members: [member] });
    } else {
      const binding = policy.bindings[existingBindingIndex];
      if (!binding.members.includes(member)) {
        binding.members.push(member);
      }
    }

    policy.version = 3;
    await bucket.iam.setPolicy(policy);

    return res.status(200).json({ ok: true, bucket: BUCKET_NAME, message: 'Bucket made public (allUsers: objectViewer)' });
  } catch (error) {
    const err = error as Error & { code?: unknown };
    return res.status(500).json({ ok: false, bucket: BUCKET_NAME, message: err.message, details: err });
  }
}


