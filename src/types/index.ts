export type SupportedFileExtension = 'xls' | 'xlsx' | 'ods' | 'pdf';

export interface DetectedHeader {
  id: string; 
  name: string;
}

export interface ParsedFileData {
  fileName: string;
  headers: DetectedHeader[];
  previewRows: string[][]; 
  rows: string[][]; 
}

export type FieldGroup = "Padrão" | "Margem" | "Histórico/Retorno" | "Personalizado";

export interface PredefinedField {
  id: string;
  name: string;
  group: FieldGroup;
  type: DataType; // Default type
  isPrincipal: boolean; // True if it's a core, non-removable field or always available
  comment?: string; // For tooltip help text
}


// Updated DATA_TYPES
export const DATA_TYPES = ["Inteiro", "Alfanumérico", "Numérico", "Data", "CPF", "CNPJ"] as const;
export type DataType = typeof DATA_TYPES[number];

// Base predefined fields. User can add more, and these can be managed.
// This list serves as the initial set of "Principal" fields.
export const INITIAL_PREDEFINED_FIELDS: PredefinedField[] = [
  // Padrão
  { id: "matricula", name: "Matrícula", group: "Padrão", type: "Alfanumérico", isPrincipal: true, comment: "Código de identificação do funcionário/cliente." },
  { id: "cpf", name: "CPF", group: "Padrão", type: "CPF", isPrincipal: true, comment: "Cadastro de Pessoa Física (11 dígitos)." },
  { id: "nome", name: "Nome", group: "Padrão", type: "Alfanumérico", isPrincipal: true, comment: "Nome completo." },
  { id: "estabelecimento_empresa", name: "Estabelecimento/Empresa", group: "Padrão", type: "Alfanumérico", isPrincipal: true, comment: "Nome do estabelecimento ou empresa." },
  { id: "orgao_filial", name: "Órgão/Filial", group: "Padrão", type: "Alfanumérico", isPrincipal: true, comment: "Órgão público ou filial da empresa." },
  { id: "cnpj", name: "CNPJ", group: "Padrão", type: "CNPJ", isPrincipal: true, comment: "Cadastro Nacional da Pessoa Jurídica (14 dígitos)." },
  { id: "email", name: "E-mail", group: "Padrão", type: "Alfanumérico", isPrincipal: false, comment: "Endereço de e-mail." },
  { id: "rg", name: "RG", group: "Padrão", type: "Alfanumérico", isPrincipal: false, comment: "Registro Geral (documento de identidade)." },
  
  // Margem
  { id: "data_nascimento", name: "Data de Nascimento", group: "Margem", type: "Data", isPrincipal: true, comment: "Data de nascimento." },
  { id: "data_admissao", name: "Data de Admissão", group: "Margem", type: "Data", isPrincipal: true, comment: "Data de admissão na empresa/órgão." },
  { id: "data_fim_contrato", name: "Data Fim do Contrato", group: "Margem", type: "Data", isPrincipal: true, comment: "Data de término do contrato (se aplicável)." },
  { id: "sinal_margem", name: "Sinal da Margem", group: "Margem", type: "Alfanumérico", isPrincipal: true, comment: "Indicador de margem positiva ou negativa (ex: '+', '-')." },
  { id: "situacao_usuario", name: "Situação do usuário", group: "Margem", type: "Alfanumérico", isPrincipal: true, comment: "Status atual do usuário (ex: Ativo, Inativo)." },
  { id: "margem_bruta", name: "Margem Bruta", group: "Margem", type: "Numérico", isPrincipal: false, comment: "Valor da margem antes de deduções." },
  { id: "margem_liquida", name: "Margem Líquida", group: "Margem", type: "Numérico", isPrincipal: false, comment: "Valor da margem após deduções." },
  { id: "margem_reservada", name: "Margem Reservada", group: "Margem", type: "Numérico", isPrincipal: false, comment: "Valor da margem comprometida." },
  { id: "categoria", name: "Categoria", group: "Margem", type: "Alfanumérico", isPrincipal: false, comment: "Categoria do funcionário/cliente." },
  { id: "regime", name: "Regime", group: "Margem", type: "Alfanumérico", isPrincipal: false, comment: "Regime de trabalho/contrato." },
  { id: "secretaria", name: "Secretaria", group: "Margem", type: "Alfanumérico", isPrincipal: false, comment: "Secretaria de lotação." },
  { id: "setor", name: "Setor", group: "Margem", type: "Alfanumérico", isPrincipal: false, comment: "Setor de trabalho." },
  { id: "tempo_casa", name: "Tempo de casa", group: "Margem", type: "Alfanumérico", isPrincipal: true, comment: "Tempo de serviço na empresa/órgão." },
  { id: "situacao", name: "Situação", group: "Margem", type: "Alfanumérico", isPrincipal: false, comment: "Situação cadastral ou funcional." },

  // Histórico/Retorno
  { id: "verba_rubrica", name: "Verba/Rubrica", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Código ou descrição da verba/rubrica." },
  { id: "prazo_total", name: "Prazo Total", group: "Histórico/Retorno", type: "Inteiro", isPrincipal: true, comment: "Número total de parcelas do contrato." },
  { id: "parcelas_pagas", name: "Parcelas Pagas", group: "Histórico/Retorno", type: "Inteiro", isPrincipal: true, comment: "Número de parcelas já quitadas." },
  { id: "parcelas_restantes", name: "Parcelas Restantes", group: "Histórico/Retorno", type: "Inteiro", isPrincipal: true, comment: "Número de parcelas pendentes." },
  { id: "valor_parcela", name: "Valor da Parcela", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Valor monetário de cada parcela." },
  { id: "valor_financiado", name: "Valor Financiado", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Montante total financiado." },
  { id: "cet_mensal", name: "CET Mensal", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Custo Efetivo Total mensal (em %)." },
  { id: "cet_anual", name: "CET Anual", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Custo Efetivo Total anual (em %)." },
  { id: "numero_contrato", name: "Número do Contrato", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Identificador único do contrato." },
  { id: "verba_rubrica_ferias", name: "Verba/Rubrica Férias", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Verba/rubrica específica para férias." },
  { id: "valor_previsto", name: "Valor Previsto", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Valor originalmente previsto." },
  { id: "valor_realizado", name: "Valor Realizado", group: "Histórico/Retorno", type: "Numérico", isPrincipal: true, comment: "Valor efetivamente realizado." },
  { id: "observacao", name: "Observação", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Informações adicionais ou comentários." },
  { id: "situacao_parcela", name: "Situação Parcela", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Status da parcela (ex: Paga, Aberta, Vencida)." },
  { id: "periodo", name: "Período", group: "Histórico/Retorno", type: "Data", isPrincipal: true, comment: "Período de referência." },
  { id: "identificador", name: "Identificador", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Identificador genérico." },
  { id: "indice", name: "Índice", group: "Histórico/Retorno", type: "Alfanumérico", isPrincipal: true, comment: "Índice de reajuste ou referência." },
].sort((a,b) => a.name.localeCompare(b.name));


export const NO_MAPPING_VALUE = "-- Sem mapeamento --" as const;
export const CUSTOM_FIELD_INDICATOR = "CustomField" as const; // Kept for internal logic if needed, but removed from UI select for adding

export type MappedFieldTarget = PredefinedField['name'] | typeof NO_MAPPING_VALUE | "";


export const DATE_FORMATS = ["AAAAMMDD", "DDMMAAAA", "MMDDAAAA", "AAAA-MM-DD", "DD/MM/AAAA", "MM/DD/AAAA"] as const;
export type DateFormatType = typeof DATE_FORMATS[number];


export interface FieldMapping {
  originalHeaderId: string; 
  originalHeaderName: string;
  mappedTo: MappedFieldTarget;
  customFieldName?: string; // Remains for cases where mappedTo might point to a truly custom, non-predefined field internally
  dataType: DataType | ""; 
  length?: number; 
  
  outputPosition?: number; 
  outputLength?: number; 
  paddingChar?: string; 
  paddingDirection?: 'Esquerda' | 'Direita'; 
  dateFormat?: DateFormatType | ""; 

  removeMask?: boolean;
  orderIndex?: number; 
}

export type OutputFormat = "txt" | "csv";
export type CsvDelimiter = "|" | ";";
export type EncodingType = "UTF-8" | "ANSI" | "ISO-8859-1";

export interface OutputConfiguration {
  format: OutputFormat | ""; 
  csvDelimiter?: CsvDelimiter;
  encoding: EncodingType;
  
  paddingChar?: string; 
  newField?: string;
  newFieldValue?: string;
}

// This type represents fields managed by the user, including initial predefined ones if they become editable.
export type UserManagedField = PredefinedField;

// Utility type for grouping
export type GroupedFields = {
  [key in FieldGroup]?: UserManagedField[];
} & { [NO_MAPPING_VALUE]?: {id: typeof NO_MAPPING_VALUE, name: typeof NO_MAPPING_VALUE}[] }
