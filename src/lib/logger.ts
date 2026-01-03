type Meta = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

export function logInfo(message: string, meta?: Meta) {
  console.info(message, meta ?? {});
}

export function logError(context: string, error: unknown, meta?: Meta) {
  console.error(context, { ...serializeError(error), ...(meta ?? {}) });
}
