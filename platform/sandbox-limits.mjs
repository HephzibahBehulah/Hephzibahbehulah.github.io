export const SANDBOX_MAX_OUTPUT_BYTES = 1024 * 1024;

function truncateUtf8(bytes, limit) {
  if (bytes.byteLength <= limit) return new TextDecoder().decode(bytes);
  let end = limit;
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) end--;
  return new TextDecoder().decode(bytes.subarray(0, end));
}

export function boundSandboxOutput(stdout, stderr, limit = SANDBOX_MAX_OUTPUT_BYTES) {
  const encoder = new TextEncoder();
  const stdoutBytes = encoder.encode(String(stdout || ""));
  const stderrBytes = encoder.encode(String(stderr || ""));
  const stdoutLimit = Math.min(stdoutBytes.byteLength, limit);
  const stderrLimit = Math.min(stderrBytes.byteLength, limit - stdoutLimit);
  const boundedStdout = truncateUtf8(stdoutBytes, stdoutLimit);
  const boundedStderr = truncateUtf8(stderrBytes, stderrLimit);
  const outputBytes = encoder.encode(boundedStdout).byteLength + encoder.encode(boundedStderr).byteLength;
  const outputLimitExceeded = stdoutBytes.byteLength > stdoutLimit || stderrBytes.byteLength > stderrLimit;
  return {stdout:boundedStdout,stderr:boundedStderr,outputBytes,outputLimitExceeded};
}
