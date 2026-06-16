declare module "pdf-parse" {
    const pdfParse: (
        dataBuffer: Buffer | Uint8Array,
        options?: Record<string, unknown>
    ) => Promise<{
        text: string;
        numpages?: number;
        numrender?: number;
        info?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        version?: string;
    }>;
    export default pdfParse;
}

declare module "mammoth" {
    export function extractRawText(input: { buffer: Buffer }): Promise<{
        value: string;
        messages: unknown[];
    }>;
}
