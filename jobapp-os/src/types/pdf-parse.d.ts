declare module "pdf-parse" {
  type PdfParseResult = {
    text: string;
  };

  export default function pdfParse(data: Buffer): Promise<PdfParseResult>;
}

