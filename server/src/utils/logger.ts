type LogMetadata = Record<string, unknown> | Error | unknown;

const serializeMetadata = (metadata?: LogMetadata): Record<string, unknown> | undefined => {
  if (!metadata) {
    return undefined;
  }

  if (metadata instanceof Error) {
    return {
      errorName: metadata.name,
      errorMessage: metadata.message,
      stack: metadata.stack
    };
  }

  if (typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }

  return { metadata };
};

const writeLog = (
  level: "info" | "warn" | "error",
  message: string,
  metadata?: LogMetadata
): void => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...serializeMetadata(metadata)
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  info(message: string, metadata?: LogMetadata): void {
    writeLog("info", message, metadata);
  },

  warn(message: string, metadata?: LogMetadata): void {
    writeLog("warn", message, metadata);
  },

  error(message: string, metadata?: LogMetadata): void {
    writeLog("error", message, metadata);
  }
};
