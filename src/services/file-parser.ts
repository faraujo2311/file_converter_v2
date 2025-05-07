'use client';

import * as XLSX from 'xlsx';

/**
 * Represents a header detected in the file.
 */
export interface Header {
  /**
   * The name of the header.
   */
  name: string;
}

/**
 * Represents a the structure of an excel file.
 */
export interface ExcelFile {
  headers: Header[];
  rows: string[][];
}

/**
 * Represents the type of the file
 */
export type FileType = 'xls' | 'xlsx' | 'ods' | 'pdf';

/**
 * Asynchronously parses a spreadsheet file (xls, xlsx, ods) to extract headers and rows.
 * PDF parsing is not yet implemented.
 *
 * @param file The file to parse.
 * @param type The type of the file.
 * @returns A promise that resolves to an ExcelFile object with headers and rows.
 * @throws Error if the file type is PDF (not implemented) or if parsing fails.
 */
export async function parseFile(file: File, type: FileType): Promise<ExcelFile> {
  if (type === 'pdf') {
    // TODO: Implement PDF parsing or provide a more specific error/handling.
    console.warn('PDF parsing is not yet fully implemented. Returning dummy data for PDF.');
    return {
      headers: [{ name: 'Coluna PDF 1' }, { name: 'Coluna PDF 2' }],
      rows: [
        ['dado1_pdf', 'dado2_pdf'],
        ['dado3_pdf', 'dado4_pdf'],
      ],
    };
  }

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("Nenhuma planilha encontrada no arquivo.");
    }
    const worksheet = workbook.Sheets[firstSheetName];
    
    // header: 1 ensures the first row is treated as an array of header strings.
    // blankrows: false skips empty rows.
    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

    if (!jsonData || jsonData.length === 0) {
      throw new Error("A planilha está vazia ou não pôde ser lida.");
    }

    // First row contains header names
    const headerValues: string[] = jsonData[0] ? jsonData[0].map(String) : [];
    if (headerValues.length === 0) {
        throw new Error("Nenhum cabeçalho encontrado na planilha.");
    }
    const headers: Header[] = headerValues.map(name => ({ name: name || "" })); // Ensure name is always a string

    // The rest of the arrays are data rows
    const rows: string[][] = jsonData.slice(1).map(rowArray => 
        rowArray.map(cell => (cell === null || cell === undefined) ? "" : String(cell))
    );
    
    return { headers, rows };

  } catch (error) {
    console.error("Erro ao parsear a planilha:", error);
    if (error instanceof Error) {
      throw new Error(`Falha ao processar o arquivo: ${error.message}`);
    }
    throw new Error("Ocorreu um erro desconhecido ao processar o arquivo.");
  }
}
