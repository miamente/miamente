let inProcessCounter = 0;

export function generateUniqueId(): string {
  inProcessCounter = (inProcessCounter + 1) % 1_000_000;
  const timestampPart = Date.now().toString(36);
  const randomPart = (
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  ).slice(0, 16);
  const counterPart = inProcessCounter.toString(36).padStart(4, "0");
  return `${timestampPart}-${randomPart}-${counterPart}`;
}

export function generateUniqueIdHex(length: number = 32): string {
  inProcessCounter = (inProcessCounter + 1) % 1_000_000;
  const tsHex = Date.now().toString(16);
  const randHex = () =>
    Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, "0");
  const base = `${tsHex}${randHex()}${randHex()}${inProcessCounter.toString(16).padStart(4, "0")}`;
  return base.slice(0, length);
}
