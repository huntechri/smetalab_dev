#!/usr/bin/env node

/**
 * Helper to manage Neon branches for testing.
 * Uses Neon API via fetch.
 */

const NEON_API_KEY = process.env.NEON_API_KEY;
const PROJECT_ID = process.env.NEON_PROJECT_ID;

if (!NEON_API_KEY || !PROJECT_ID) {
  // If not configured, we just return null to fallback to static test DB
  process.exit(0);
}

const API_BASE = 'https://console.neon.tech/api/v2';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${NEON_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Neon API Error: ${JSON.stringify(err)}`);
  }
  return res.json();
}

async function createBranch(name) {
  console.log(`Creating Neon branch: ${name}...`);
  const data = await request(`/projects/${PROJECT_ID}/branches`, {
    method: 'POST',
    body: JSON.stringify({
      branch: { name },
    }),
  });
  
  const branchId = data.branch.id;
  
  // Get connection string
  const endpoints = await request(`/projects/${PROJECT_ID}/endpoints`);
  const endpoint = endpoints.endpoints.find(e => e.branch_id === branchId);
  
  if (!endpoint) throw new Error('No endpoint found for new branch');
  
  const host = endpoint.host;
  // Note: Password is not returned in the API for existing roles usually, 
  // but for a new branch, the owner role exists.
  // We assume the same password as the main branch if it's the same project.
  // Actually, standard Neon URL format: postgresql://user:pass@host/neondb
  
  // For simplicity in this script, we output the branch ID so the caller can use it.
  console.log(`BRANCH_ID=${branchId}`);
  console.log(`HOST=${host}`);
}

async function deleteBranch(branchId) {
  console.log(`Deleting Neon branch: ${branchId}...`);
  await request(`/projects/${PROJECT_ID}/branches/${branchId}`, {
    method: 'DELETE',
  });
}

const [action, ...args] = process.argv.slice(2);

try {
  if (action === 'create') {
    await createBranch(args[0] || `test-${Date.now()}`);
  } else if (action === 'delete') {
    await deleteBranch(args[0]);
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
