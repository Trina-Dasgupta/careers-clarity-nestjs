// Judge0 helper. Supports two modes:
// - Real Judge0 API mode: set `USE_REAL_JUDGE0=true` and `JUDGE0_API_URL`.
//   In that case the helper will use global `fetch` to call the API.
// - Simulated mode (default): useful for local development and tests
//   when you don't want to depend on an external Judge0 instance.

type SubmissionInput = {
    source_code: string;
    language_id: number;
    stdin?: string;
    expected_output?: string;
};

const LANGUAGE_MAP: Record<string, number> = {
    javascript: 63,
    nodejs: 63,
    typescript: 74,
    ts: 74,
    python: 71,
    python3: 71,
    java: 62,
    cpp: 54,
    'c++': 54,
    c: 50,
    go: 60,
    ruby: 72,
    php: 68,
    rust: 73,
};

const LANGUAGE_NAMES: Record<number, string> = {
    74: 'TypeScript',
    63: 'JavaScript',
    71: 'Python',
    62: 'Java',
    54: 'C++',
    50: 'C',
    60: 'Go',
    72: 'Ruby',
    68: 'PHP',
    73: 'Rust',
};

export function getJudge0LanguageId(language: string): number | null {
    if (!language) return null;
    const key = language.toLowerCase();
    return LANGUAGE_MAP[key] ?? null;
}

export function getLanguageName(languageId: number): string {
    return LANGUAGE_NAMES[languageId] ?? 'Unknown';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function realSubmitBatch(submissions: SubmissionInput[]) {
    const base = process.env.JUDGE0_API_URL;
    if (!base) throw new Error('JUDGE0_API_URL not configured');

    const url = `${base.replace(/\/$/, '')}/submissions/batch?base64_encoded=false`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions }),
    });
    if (!res.ok) throw new Error(`Judge0 submit failed: ${res.status}`);
    const data = await res.json();
    return data; // expecting array of { token }
}

async function realPollBatchResults(tokens: string[]) {
    const base = process.env.JUDGE0_API_URL;
    if (!base) throw new Error('JUDGE0_API_URL not configured');

    const url = `${base.replace(/\/$/, '')}/submissions/batch`;

    while (true) {
        const params = new URLSearchParams();
        params.set('tokens', tokens.join(','));
        params.set('base64_encoded', 'false');

        const res = await fetch(`${url}?${params.toString()}`);
        if (!res.ok) throw new Error(`Judge0 poll failed: ${res.status}`);
        const data = await res.json();
        const results = data.submissions ?? [];

        const isAllDone = results.every((r: any) => r.status.id !== 1 && r.status.id !== 2);
        if (isAllDone) return results;
        await sleep(1000);
    }
}

// Simulated implementations (fast, deterministic)
async function simulatedSubmitBatch(submissions: SubmissionInput[]) {
    // Return stub tokens
    return submissions.map((_, i) => ({ token: `sim-${Date.now()}-${i}` }));
}

async function simulatedPollBatchResults(tokens: string[]) {
    await sleep(30);
    return tokens.map((t) => ({ token: t, status: { id: 3, description: 'Accepted' } }));
}

export async function submitBatch(submissions: SubmissionInput[]) {
    const useReal = process.env.USE_REAL_JUDGE0 === 'true' && !!process.env.JUDGE0_API_URL && typeof fetch === 'function';
    if (useReal) return realSubmitBatch(submissions);
    return simulatedSubmitBatch(submissions);
}

export async function pollBatchResults(tokens: string[]) {
    const useReal = process.env.USE_REAL_JUDGE0 === 'true' && !!process.env.JUDGE0_API_URL && typeof fetch === 'function';
    if (useReal) return realPollBatchResults(tokens);
    return simulatedPollBatchResults(tokens);
}
