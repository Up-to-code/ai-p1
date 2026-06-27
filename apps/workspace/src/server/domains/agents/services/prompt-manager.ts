/**
 * Prompt Manager Service
 *
 * Handles long prompt processing, structured compression, and context management
 * for Workspace AI Agent to prevent truncation and context loss.
 */

export interface PromptChunk {
  content: string;
  index: number;
  total: number;
  metadata: {
    originalLength: number;
    chunkLength: number;
    estimatedTokens: number;
  };
}

export interface PromptProcessingOptions {
  maxTokens?: number;
  enableChunking?: boolean;
  preserveContext?: boolean;
  onChunkComplete?: (chunk: PromptChunk) => void;
  onProgress?: (message: string) => void;
  onError?: (error: Error) => void;
}

export interface PromptProcessingResult {
  success: boolean;
  processedPrompt: string;
  chunks?: PromptChunk[];
  wasChunked: boolean;
  wasTruncated: boolean;
  originalLength: number;
  processedLength: number;
  error?: string;
}

const HARD_CHAR_LIMIT = 128_000;
const SOFT_CHAR_LIMIT = 32_000;
const PRESERVE_START_CHARS = 80_000;
const PRESERVE_END_CHARS = 16_000;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function isPromptTooLong(prompt: string, maxTokens: number = 8000): boolean {
  return estimateTokens(prompt) > maxTokens;
}

function generatePromptSummary(prompt: string): string {
  const firstSentence = prompt.split(/[.!?]/)[0];
  const words = prompt.split(/\s+/);
  const keyTopics = words
    .filter(word => word.length > 5)
    .slice(0, 5)
    .join(", ");

  const truncated = firstSentence.length > 100
    ? firstSentence.slice(0, 100) + "..."
    : firstSentence;

  return `${truncated}. Topics: ${keyTopics || "general"}`;
}

function chunkPrompt(
  prompt: string,
  maxTokens: number = 4000,
  preserveContext: boolean = true
): PromptChunk[] {
  const chunks: PromptChunk[] = [];
  const maxChunkLength = maxTokens * 4;

  if (prompt.length <= maxChunkLength) {
    return [{
      content: prompt,
      index: 0,
      total: 1,
      metadata: {
        originalLength: prompt.length,
        chunkLength: prompt.length,
        estimatedTokens: estimateTokens(prompt),
      },
    }];
  }

  const paragraphs = prompt.split(/\n\n+/);
  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const potentialChunk = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (potentialChunk.length <= maxChunkLength) {
      currentChunk = potentialChunk;
    } else {
      if (currentChunk) {
        chunks.push({
          content: currentChunk,
          index: chunkIndex,
          total: 0,
          metadata: {
            originalLength: prompt.length,
            chunkLength: currentChunk.length,
            estimatedTokens: estimateTokens(currentChunk),
          },
        });
        chunkIndex++;
        currentChunk = "";
      }

      if (paragraph.length > maxChunkLength) {
        const sentences = paragraph.split(/(?<=[.!?])\s+/);
        for (const sentence of sentences) {
          const potentialSentence = currentChunk
            ? `${currentChunk} ${sentence}`
            : sentence;

          if (potentialSentence.length <= maxChunkLength) {
            currentChunk = potentialSentence;
          } else {
            if (currentChunk) {
              chunks.push({
                content: currentChunk,
                index: chunkIndex,
                total: 0,
                metadata: {
                  originalLength: prompt.length,
                  chunkLength: currentChunk.length,
                  estimatedTokens: estimateTokens(currentChunk),
                },
              });
              chunkIndex++;
              currentChunk = "";
            }
            if (sentence.length > maxChunkLength) {
              for (let i = 0; i < sentence.length; i += maxChunkLength) {
                chunks.push({
                  content: sentence.slice(i, i + maxChunkLength),
                  index: chunkIndex,
                  total: 0,
                  metadata: {
                    originalLength: prompt.length,
                    chunkLength: maxChunkLength,
                    estimatedTokens: estimateTokens(sentence.slice(i, i + maxChunkLength)),
                  },
                });
                chunkIndex++;
              }
            } else {
              currentChunk = sentence;
            }
          }
        }
      } else {
        currentChunk = paragraph;
      }
    }
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk,
      index: chunkIndex,
      total: 0,
      metadata: {
        originalLength: prompt.length,
        chunkLength: currentChunk.length,
        estimatedTokens: estimateTokens(currentChunk),
      },
    });
  }

  chunks.forEach(chunk => chunk.total = chunks.length);
  return chunks;
}

function addContextHeaders(chunks: PromptChunk[], originalPrompt: string): PromptChunk[] {
  if (chunks.length <= 1) return chunks;

  const summary = generatePromptSummary(originalPrompt);

  return chunks.map((chunk, index) => {
    let content = chunk.content;

    const header = `[Context: Part ${index + 1} of ${chunks.length}]`;
    const summaryText = index === 0
      ? `[Overall Summary: ${summary}]`
      : `[Continuing from previous part. Summary: ${summary}]`;

    content = `${header}\n${summaryText}\n\n${content}`;

    return {
      ...chunk,
      content,
      metadata: {
        ...chunk.metadata,
        chunkLength: content.length,
        estimatedTokens: estimateTokens(content),
      },
    };
  });
}

/**
 * Process a prompt with structured compression for long content.
 *
 * Strategy:
 * - Prompts under SOFT_CHAR_LIMIT (32K chars / ~8K tokens): pass through unchanged
 * - Prompts under HARD_CHAR_LIMIT (128K chars / ~32K tokens): compress middle sections
 *   while preserving start (instructions + key context) and end (current request)
 * - Prompts over HARD_CHAR_LIMIT: reject with clear error
 */
export function processPrompt(
  prompt: string,
  options: PromptProcessingOptions = {}
): PromptProcessingResult {
  const {
    maxTokens = 8000,
    enableChunking = true,
    preserveContext = true,
    onChunkComplete,
    onProgress,
    onError,
  } = options;

  const originalLength = prompt.length;
  const estimatedTokens = estimateTokens(prompt);

  try {
    if (prompt.length > HARD_CHAR_LIMIT) {
      const msg = `Prompt exceeds maximum length of ${HARD_CHAR_LIMIT.toLocaleString()} characters (${estimatedTokens.toLocaleString()} estimated tokens). Please shorten your request.`;
      onError?.(new Error(msg));
      return {
        success: false,
        processedPrompt: prompt,
        wasChunked: false,
        wasTruncated: true,
        originalLength,
        processedLength: prompt.length,
        error: msg,
      };
    }

    if (!isPromptTooLong(prompt, maxTokens) || !enableChunking) {
      return {
        success: true,
        processedPrompt: prompt,
        wasChunked: false,
        wasTruncated: false,
        originalLength,
        processedLength: prompt.length,
      };
    }

    onProgress?.(`Processing long prompt (${estimatedTokens.toLocaleString()} estimated tokens)`);

    if (prompt.length > SOFT_CHAR_LIMIT) {
      onProgress?.("Compressing middle sections while preserving key context...");

      const startSection = prompt.slice(0, PRESERVE_START_CHARS);
      const endSection = prompt.slice(-PRESERVE_END_CHARS);
      const middleSection = prompt.slice(PRESERVE_START_CHARS, -PRESERVE_END_CHARS);

      const middleParagraphs = middleSection.split(/\n\n+/).filter(p => p.trim().length > 0);
      const totalMiddle = middleParagraphs.length;

      let compressedMiddle: string;
      if (totalMiddle <= 20) {
        compressedMiddle = middleSection;
      } else {
        const keepCount = Math.max(4, Math.floor(totalMiddle * 0.15));
        const firstBatch = middleParagraphs.slice(0, keepCount);
        const lastBatch = middleParagraphs.slice(-keepCount);
        const removedCount = totalMiddle - keepCount * 2;

        compressedMiddle = [
          ...firstBatch,
          `\n[... ${removedCount} sections compressed for length. ` +
          `Original content preserved for: ${generatePromptSummary(middleSection)} ...]\n`,
          ...lastBatch,
        ].join("\n\n");
      }

      const compressed = `${startSection}\n\n${compressedMiddle}\n\n${endSection}`;
      const compressedTokens = estimateTokens(compressed);

      onProgress?.(`Compressed from ${estimatedTokens.toLocaleString()} to ${compressedTokens.toLocaleString()} tokens`);

      let chunks = chunkPrompt(compressed, maxTokens / 2, preserveContext);
      if (preserveContext) {
        chunks = addContextHeaders(chunks, prompt);
      }

      chunks.forEach(chunk => onChunkComplete?.(chunk));

      const processedPrompt = chunks
        .map(chunk => chunk.content)
        .join("\n\n--- [END OF PART] ---\n\n");

      return {
        success: true,
        processedPrompt,
        chunks,
        wasChunked: true,
        wasTruncated: true,
        originalLength,
        processedLength: processedPrompt.length,
      };
    }

    let chunks = chunkPrompt(prompt, maxTokens / 2, preserveContext);
    if (preserveContext) {
      chunks = addContextHeaders(chunks, prompt);
    }

    chunks.forEach(chunk => onChunkComplete?.(chunk));

    const processedPrompt = chunks
      .map(chunk => chunk.content)
      .join("\n\n--- [END OF PART] ---\n\n");

    return {
      success: true,
      processedPrompt,
      chunks,
      wasChunked: true,
      wasTruncated: false,
      originalLength,
      processedLength: processedPrompt.length,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    return {
      success: false,
      processedPrompt: prompt,
      wasChunked: false,
      wasTruncated: false,
      originalLength,
      processedLength: prompt.length,
      error: errorMessage,
    };
  }
}

export function validatePrompt(prompt: string): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!prompt || prompt.trim().length === 0) {
    errors.push("Prompt is empty");
  }

  if (prompt.length > HARD_CHAR_LIMIT) {
    errors.push(`Prompt exceeds maximum length of ${HARD_CHAR_LIMIT.toLocaleString()} characters`);
  }

  if (prompt.length > SOFT_CHAR_LIMIT) {
    warnings.push("Prompt is very long and will be compressed for processing");
  }

  if (estimateTokens(prompt) > 32000) {
    errors.push("Prompt exceeds maximum token limit of 32,000");
  }

  if (estimateTokens(prompt) > 16000) {
    warnings.push("Prompt approaches token limits and may require compression");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function optimizePrompt(prompt: string): string {
  let optimized = prompt;

  optimized = optimized.replace(/\s{3,}/g, ' ');
  optimized = optimized.replace(/\n{3,}/g, '\n\n');

  const paragraphs = optimized.split(/\n\n+/);
  const uniqueParagraphs = [...new Set(paragraphs)];
  optimized = uniqueParagraphs.join('\n\n');

  optimized = optimized
    .split(/\n\n+/)
    .filter(p => p.trim().length > 10)
    .join('\n\n');

  return optimized.trim();
}

export function getPromptStats(prompt: string) {
  return {
    length: prompt.length,
    wordCount: prompt.split(/\s+/).length,
    paragraphCount: prompt.split(/\n\n+/).length,
    estimatedTokens: estimateTokens(prompt),
    estimatedCostUSD: (estimateTokens(prompt) / 1000) * 0.0001,
  };
}
