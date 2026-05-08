export interface GridBatchEnvelope {
  readonly batchId: string;
  readonly itemCount: number;
  readonly concurrencyLimit?: number;
}
