"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FieldMapping } from '@/components/data-forge/FieldMapping';
import { OutputConfiguration } from '@/components/data-forge/OutputConfiguration';
import { Stepper } from '@/components/shared/Stepper';
import { parseFile, type ExcelFile } from '@/services/file-parser';
import type { SupportedFileExtension, ParsedFileData, FieldMapping as FieldMappingType, OutputConfiguration as OutputConfigType, UserManagedField, DetectedHeader } from '@/types';
import { CUSTOM_FIELD_INDICATOR, INITIAL_PREDEFINED_FIELDS, NO_MAPPING_VALUE } from '@/types';
import { Download, Loader2, AlertTriangle, UploadCloud, Info, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label'; // Added import for Label

const SUPPORTED_EXTENSIONS: SupportedFileExtension[] = ['xls', 'xlsx', 'ods', 'pdf'];
const STEPS = ["Upload", "Mapeamento", "Configurar Saída", "Resultado"];

interface ConversionResult {
  success: boolean;
  fileName?: string;
  message: string;
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFileData | null>(null);
  const [fieldMappings, setFieldMappings] = useState<FieldMappingType[]>([]);
  const [userManagedFields, setUserManagedFields] = useState<UserManagedField[]>(INITIAL_PREDEFINED_FIELDS);
  const [outputConfig, setOutputConfig] = useState<OutputConfigType>({ format: "", encoding: "UTF-8" });
  const [isProcessing, setIsProcessing] = useState(false); 
  const [formError, setFormError] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);


  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAllState = () => {
    setSelectedFile(null);
    setParsedData(null);
    setFieldMappings([]);
    // Consider loading userManagedFields from localStorage if "Principal" fields should persist across full resets.
    // For now, resetting to initial.
    // setUserManagedFields(INITIAL_PREDEFINED_FIELDS); 
    setOutputConfig({ format: "", encoding: "UTF-8" });
    setFormError(null);
    setConversionResult(null);
    setPreviewContent(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setCurrentStep(1);
  };
  
  useEffect(() => {
    setFormError(null);
  }, [currentStep]);

  const handleFileChangeInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setParsedData(null);
    setFieldMappings([]);
    setOutputConfig({ format: "", encoding: "UTF-8" });
    setFormError(null);
    setConversionResult(null);
    setPreviewContent(null);
    setIsProcessing(true);

    toast({ title: "Processando arquivo...", description: "Aguarde enquanto lemos o arquivo." });
    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() as SupportedFileExtension;
      if (!SUPPORTED_EXTENSIONS.includes(fileExtension)) {
        throw new Error(`Formato de arquivo não suportado: .${fileExtension}`);
      }
      const parsed: ExcelFile = await parseFile(file, fileExtension);

      const detectedHeaders: DetectedHeader[] = parsed.headers.map((h, index) => ({
        id: `header_${index}_${h.name.replace(/\s+/g, '_') || `col${index}`}`,
        name: h.name || `Coluna ${index + 1}`, 
      }));

      setParsedData({
        fileName: file.name,
        headers: detectedHeaders,
        previewRows: parsed.rows.slice(0, 5),
        rows: parsed.rows, 
      });

      const initialMappings = detectedHeaders.map((header, index) => {
        const matchedPredefined = userManagedFields.find(pf => header.name.toLowerCase().includes(pf.name.toLowerCase()));
        return {
          originalHeaderId: header.id,
          originalHeaderName: header.name,
          mappedTo: matchedPredefined ? matchedPredefined.name : NO_MAPPING_VALUE,
          dataType: matchedPredefined ? matchedPredefined.type : "",
          removeMask: false,
          paddingDirection: 'Direita',
          orderIndex: index + 1, // Initialize orderIndex
        };
      });
      setFieldMappings(initialMappings);
      setCurrentStep(2);
      toast({ title: "Arquivo processado!", description: "Revise os cabeçalhos e configure o mapeamento." });
    } catch (error) {
      console.error("Error parsing file:", error);
      const errorMessage = error instanceof Error ? error.message : "Não foi possível ler o arquivo.";
      toast({ variant: "destructive", title: "Erro ao processar arquivo", description: `${errorMessage} Verifique o formato e tente novamente.` });
      setSelectedFile(null); 
      setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
    } finally {
      setIsProcessing(false);
    }
  }, [toast, userManagedFields]); // userManagedFields dependency ensures auto-mapping uses current fields

  const handleMappingsChange = useCallback((updatedMappings: FieldMappingType[]) => {
    setFieldMappings(updatedMappings);
  }, []);

  const handleUserManagedFieldsChange = useCallback((updatedFields: UserManagedField[]) => {
    setUserManagedFields(updatedFields);
  }, []);

  const handleConfigChange = useCallback((fieldName: keyof OutputConfigType, value: any) => {
    setOutputConfig(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const handleMappingFieldChange = useCallback((originalHeaderId: string, fieldName: keyof FieldMappingType, value: any) => {
    setFieldMappings(prevMappings =>
      prevMappings.map(m => {
        if (m.originalHeaderId === originalHeaderId) {
          const updatedMapping = { ...m, [fieldName]: value };
          if (fieldName === 'mappedTo') {
            const selectedField = userManagedFields.find(f => f.name === value);
            updatedMapping.dataType = selectedField ? selectedField.type : "";
             if (value === NO_MAPPING_VALUE || value === "") {
                updatedMapping.dataType = "";
            }
          }
          return updatedMapping;
        }
        return m;
      })
    );
  }, [userManagedFields]);

  const handleOrderChange = useCallback((originalHeaderId: string, direction: 'up' | 'down') => {
    setFieldMappings(prevMappings => {
        const newMappings = [...prevMappings];

        // Get only the fields that are actually part of the output and sort them by their current visual order
        const outputFieldItems = newMappings
            .filter(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType)
            .sort((a, b) => (a.orderIndex ?? Infinity) - (b.orderIndex ?? Infinity));

        const currentItemDisplayIndex = outputFieldItems.findIndex(m => m.originalHeaderId === originalHeaderId);

        if (currentItemDisplayIndex === -1) return prevMappings; // Should not happen

        let swapWithItemDisplayIndex = -1;
        if (direction === 'up' && currentItemDisplayIndex > 0) {
            swapWithItemDisplayIndex = currentItemDisplayIndex - 1;
        } else if (direction === 'down' && currentItemDisplayIndex < outputFieldItems.length - 1) {
            swapWithItemDisplayIndex = currentItemDisplayIndex + 1;
        }

        if (swapWithItemDisplayIndex !== -1) {
            const itemToMove = outputFieldItems[currentItemDisplayIndex];
            const itemToSwapWith = outputFieldItems[swapWithItemDisplayIndex];

            // Find these items in the original newMappings array to swap their orderIndex
            const originalIndexToMove = newMappings.findIndex(m => m.originalHeaderId === itemToMove.originalHeaderId);
            const originalIndexToSwapWith = newMappings.findIndex(m => m.originalHeaderId === itemToSwapWith.originalHeaderId);

            if (originalIndexToMove !== -1 && originalIndexToSwapWith !== -1) {
                const tempOrder = newMappings[originalIndexToMove].orderIndex;
                newMappings[originalIndexToMove].orderIndex = newMappings[originalIndexToSwapWith].orderIndex;
                newMappings[originalIndexToSwapWith].orderIndex = tempOrder;
            }
        }
        return newMappings;
    });
  }, []);


  const validateMappings = (): string[] => {
    const errors: string[] = [];
    // No specific errors enforced here for now, but can be added
    // if (!fieldMappings.some(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType)) {
      // errors.push("Pelo menos um campo deve ser mapeado e ter um tipo de dado definido.");
    // }
    fieldMappings.forEach(m => {
      if (m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && !m.dataType) {
        errors.push(`O campo mapeado para "${m.originalHeaderName}" (${m.mappedTo}) precisa de um Tipo de Dado.`);
      }
    });
    return errors;
  };

  const validateOutputConfig = (): string[] => {
    const errors: string[] = [];
    if (!outputConfig.format) {
      errors.push("O Formato do Arquivo de Saída deve ser selecionado.");
    }
    if (outputConfig.format === 'csv' && !outputConfig.csvDelimiter) {
      errors.push("Um Delimitador CSV deve ser selecionado.");
    }
    if (outputConfig.format === 'txt') {
      const mappedFieldsForTxt = fieldMappings.filter(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType);
      mappedFieldsForTxt.forEach(m => {
        if (typeof m.outputLength !== 'number' || m.outputLength < 1) {
          errors.push(`Campo "${m.mappedTo === CUSTOM_FIELD_INDICATOR ? m.customFieldName : m.mappedTo}" precisa de um Tamanho (Tam.) válido.`);
        }
      });
    }
    return errors;
  };

  const handleNextStep = () => {
    setFormError(null);
    let errors: string[] = [];
    
    if (currentStep === 1 && !selectedFile) {
        errors.push("Por favor, selecione um arquivo para continuar.");
    }
    if (currentStep === 2 && parsedData) { 
      errors = validateMappings();
    }
    if (currentStep === 3 && parsedData) { 
      errors = validateOutputConfig();
    }

    if (errors.length > 0) {
      const errorMsg = errors.join(' ');
      setFormError(errorMsg);
      toast({ variant: "destructive", title: `Erro na Etapa ${currentStep}`, description: errorMsg });
      return;
    }
    
    if (currentStep === 3) { 
      handleConvert();
    } else if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatNumericValue = (value: string): string => {
    if (value === null || value === undefined || value.trim() === "") return "0,00";
    let numericString = value.replace(",", ".");
    if (numericString.startsWith("-")) {
        numericString = numericString.substring(1); // Handle sign separately for parsing
    }
    let numericValue = parseFloat(numericString);
    if (isNaN(numericValue)) return "0,00";
    return numericValue.toFixed(2).replace('.', ',');
  };
  
  const applyTxtPadding = (value: string, length: number, paddingChar: string = ' ', direction: 'Esquerda' | 'Direita' = 'Direita', isNegative: boolean = false): string => {
    let finalValue = value;
    // For negative numbers, one character is reserved for the sign '-' at the beginning.
    const actualLength = isNegative ? length - 1 : length;

    if (finalValue.length > actualLength) {
      finalValue = finalValue.substring(0, actualLength);
    } else if (finalValue.length < actualLength) {
      if (direction === 'Esquerda') {
        finalValue = finalValue.padStart(actualLength, paddingChar);
      } else {
        finalValue = finalValue.padEnd(actualLength, paddingChar);
      }
    }
    return isNegative ? `-${finalValue}` : finalValue;
  };


  const handleConvert = async () => {
    if (!selectedFile || !parsedData) {
      toast({ variant: "destructive", title: "Erro", description: "Nenhum arquivo selecionado ou dados parseados." });
      return;
    }

    setIsProcessing(true);
    setConversionResult(null);
    setPreviewContent(null);
    toast({ title: "Iniciando conversão...", description: "Seu arquivo está sendo processado." });

    await new Promise(resolve => setTimeout(resolve, 1000)); 

    try {
      let outputContent = "";
      
      if (outputConfig.format === 'txt') {
        const dataRows = parsedData.rows; 
        const orderedMappings = fieldMappings
          .filter(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType && typeof m.outputLength === 'number')
          .sort((a, b) => (a.orderIndex ?? Infinity) - (b.orderIndex ?? Infinity)); 

        dataRows.forEach(row => {
          let line = "";
          orderedMappings.forEach(m => {
            const originalHeaderIndex = parsedData.headers.findIndex(h => h.id === m.originalHeaderId);
            let cellValue = originalHeaderIndex !== -1 && row[originalHeaderIndex] !== undefined ? String(row[originalHeaderIndex]) : "";
            
            const isNegativeOriginal = cellValue.startsWith('-');
            let valueToFormat = cellValue;
            if (isNegativeOriginal) {
                valueToFormat = cellValue.substring(1); // Remove sign for formatting if numeric
            }

            if (m.removeMask) {
                if (m.dataType === 'CPF') valueToFormat = valueToFormat.replace(/\D/g, '');
                else if (m.dataType === 'CNPJ') valueToFormat = valueToFormat.replace(/\D/g, '');
                // For other types, removing mask usually means removing non-alphanumeric, but be careful
                // else valueToFormat = valueToFormat.replace(/[^a-zA-Z0-9]/g, ''); 
            }
            
            let formattedValue = valueToFormat;
            if (m.dataType === 'Numérico') {
                formattedValue = formatNumericValue(valueToFormat); // formatNumericValue expects positive string
            }
            // TODO: Apply dateFormat if m.dataType is 'Data' and m.dateFormat is set

            const targetLength = m.outputLength!;
            const defaultPaddingChar = (m.dataType === "Numérico" || m.dataType === "Inteiro") ? '0' : ' ';
            const paddingCharToUse = m.paddingChar || defaultPaddingChar;
            
            formattedValue = applyTxtPadding(formattedValue, targetLength, paddingCharToUse, m.paddingDirection, isNegativeOriginal && (m.dataType === 'Numérico' || m.dataType === 'Inteiro'));
            
            line += formattedValue;
          });
          
          if (outputConfig.newField && outputConfig.newFieldValue) {
            // This field should also respect its own length/padding if defined, not currently supported by this simple addition
            line += outputConfig.newFieldValue; 
          }
          outputContent += line + '\r\n'; // Windows line ending
        });

      } else if (outputConfig.format === 'csv') {
        const headers = fieldMappings
            .filter(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType) 
            .map(m => m.mappedTo === CUSTOM_FIELD_INDICATOR ? (m.customFieldName || m.mappedTo) : m.mappedTo) // Fallback for customFieldName
            .join(outputConfig.csvDelimiter);
        outputContent += headers + '\n';

        parsedData.rows.forEach(row => {
            const lineContent = fieldMappings
                .filter(m => m.mappedTo && m.mappedTo !== NO_MAPPING_VALUE && m.dataType)
                .map(m => {
                    const originalHeaderIndex = parsedData.headers.findIndex(h => h.id === m.originalHeaderId);
                    let cellValue = originalHeaderIndex !== -1 && row[originalHeaderIndex] !== undefined ? String(row[originalHeaderIndex]) : "";
                    if (m.removeMask) {
                      if (m.dataType === 'CPF') cellValue = cellValue.replace(/\D/g, '');
                      else if (m.dataType === 'CNPJ') cellValue = cellValue.replace(/\D/g, '');
                      // else cellValue = cellValue.replace(/[^a-zA-Z0-9]/g, '');
                    }
                    if (m.dataType === 'Numérico') {
                        cellValue = formatNumericValue(cellValue);
                    }
                    // TODO: Apply dateFormat if m.dataType is 'Data' and m.dateFormat is set
                    // Basic CSV quoting for values containing delimiter or quotes
                    if (cellValue.includes(outputConfig.csvDelimiter!) || cellValue.includes('"')) {
                        cellValue = `"${cellValue.replace(/"/g, '""')}"`;
                    }
                    return cellValue;
                })
                .join(outputConfig.csvDelimiter);
            outputContent += lineContent + '\n';
        });
      } else {
          throw new Error("Formato de saída não especificado ou inválido.");
      }
      
      setPreviewContent(outputContent);
      const outputFileName = `${selectedFile.name.split('.')[0]}_convertido.${outputConfig.format}`;
      
      setConversionResult({ success: true, fileName: outputFileName, message: "Conversão concluída com sucesso! Confira a pré-visualização abaixo."});
      setCurrentStep(4); 
      toast({ title: "Conversão Concluída!", description: `Pré-visualização gerada para ${outputFileName}.` });

    } catch (err) {
      console.error("Conversion failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido durante a conversão.";
      setConversionResult({ success: false, message: errorMessage });
      setPreviewContent(null);
      setCurrentStep(4); 
      toast({ variant: "destructive", title: "Falha na Conversão", description: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadResult = () => {
    if (conversionResult?.success && previewContent && conversionResult.fileName && outputConfig.format) {
      const charset = outputConfig.encoding === 'ANSI' ? 'windows-1252' : outputConfig.encoding === 'ISO-8859-1' ? 'iso-8859-1' : 'utf-8';
      const blob = new Blob([previewContent], { type: `${outputConfig.format === 'txt' ? 'text/plain' : 'text/csv'};charset=${charset}` });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', conversionResult.fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      URL.revokeObjectURL(url); // Clean up
      toast({ title: "Download Iniciado", description: `Baixando ${conversionResult.fileName}`});
    } else {
        toast({ variant: "destructive", title: "Erro ao Baixar", description: "Conteúdo do arquivo não disponível para download."});
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">SCA - Sistema para conversão de arquivos</h1>
        <p className="text-muted-foreground">Converta seus arquivos Excel ou PDF (em teste) para layouts TXT ou CSV personalizados.</p>
        <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center">
          <Info className="h-4 w-4 mr-1" />
          Seus dados não são armazenados, garantindo conformidade com a LGPD.
        </p>
      </div>

      <Stepper 
        currentStep={currentStep} 
        steps={STEPS} 
        onStepClick={(step) => {
          if (step < currentStep && parsedData) { 
            setCurrentStep(step);
          } else if (step === currentStep) {
            // No action
          } else { 
            let errors: string[] = [];
            if (currentStep === 1 && !selectedFile) errors.push("Selecione um arquivo.");
            else if (currentStep === 2 && parsedData) errors = validateMappings();
            else if (currentStep === 3 && parsedData) errors = validateOutputConfig();

            if (errors.length > 0) {
                 toast({variant: "destructive", title: "Etapa Incompleta", description: `Corrija os erros na etapa atual: ${errors.join(' ')}`});
            } else if (step === currentStep + 1 && selectedFile && parsedData) { 
                 setCurrentStep(step);
            } else if (step > currentStep + 1 && (!selectedFile || !parsedData)){
                toast({variant: "destructive", title: "Navegação Inválida", description: "Complete as etapas anteriores primeiro."});
            }
          }
        }}
        completedSteps={ Array.from({length: currentStep -1 }, (_,i) => i+1)}
      />

      {formError && (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro de Validação</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        {currentStep === 1 && (
          <Card>
             <CardHeader>
                {/* Title removed as per request */}
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6 p-8 min-h-[200px]">
              <Button size="lg" onClick={() => fileInputRef.current?.click()} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
                {isProcessing ? "Processando..." : (selectedFile ? `Arquivo: ${selectedFile.name}` : "Selecione o Arquivo para Conversão")}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChangeInternal} 
                className="hidden" 
                accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(',')} 
                disabled={isProcessing}
              />
              <p className="text-sm text-muted-foreground">Formatos suportados: {SUPPORTED_EXTENSIONS.map(s => s.toUpperCase()).join(', ')}.</p>
              {selectedFile && !isProcessing && (
                 <Button variant="outline" size="sm" onClick={() => {
                   if (fileInputRef.current) fileInputRef.current.value = ""; 
                   fileInputRef.current?.click();
                  }}>Trocar Arquivo</Button>
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && parsedData && (
          <FieldMapping
            detectedHeaders={parsedData.headers}
            previewRows={parsedData.previewRows}
            totalRows={parsedData.rows.length}
            mappings={fieldMappings}
            userManagedFields={userManagedFields}
            onMappingsChange={handleMappingsChange}
            onUserManagedFieldsChange={handleUserManagedFieldsChange}
            onMappingFieldChange={handleMappingFieldChange}
          />
        )}
         {currentStep === 2 && !parsedData && !isProcessing && (
          <Card>
            <CardHeader><CardTitle>Mapeamento de Colunas de Entrada</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Por favor, faça o upload de um arquivo primeiro para iniciar o mapeamento.</p></CardContent>
          </Card>
        )}


        {currentStep === 3 && parsedData && (
          <OutputConfiguration
            config={outputConfig}
            mappings={fieldMappings}
            onConfigChange={handleConfigChange}
            onMappingFieldChange={handleMappingFieldChange}
            onOrderChange={handleOrderChange}
          />
        )}
        {currentStep === 3 && !parsedData && !isProcessing && (
          <Card>
            <CardHeader><CardTitle>Configurar Saída</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground">Por favor, complete as etapas de upload e mapeamento primeiro.</p></CardContent>
          </Card>
        )}


        {currentStep === 4 && conversionResult && (
           <Card>
            <CardHeader>
                <CardTitle className="text-center flex items-center justify-center">
                    {conversionResult.success ? <CheckCircle className="h-7 w-7 mr-2 text-green-500" /> : <AlertTriangle className="h-7 w-7 mr-2 text-destructive" /> }
                    Resultado da Conversão
                </CardTitle>
                <CardDescription className="text-center">
                    {conversionResult.message}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4 p-6">
                {conversionResult.success && previewContent && (
                    <div className="space-y-2">
                        <Label htmlFor="conversion-preview">Pré-visualização do Arquivo ({conversionResult.fileName})</Label>
                        <Textarea
                            id="conversion-preview"
                            value={previewContent}
                            readOnly
                            rows={10}
                            className="w-full min-h-[200px] text-xs font-mono bg-muted/30 border rounded-md"
                            placeholder="A pré-visualização do arquivo convertido aparecerá aqui..."
                        />
                    </div>
                )}
                {conversionResult.success && conversionResult.fileName && previewContent && (
                    <Button size="lg" onClick={handleDownloadResult} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
                        Baixar {conversionResult.fileName}
                    </Button>
                )}
                 <Button variant="outline" onClick={resetAllState} disabled={isProcessing}>
                    Converter Novo Arquivo
                </Button>
            </CardContent>
           </Card>
        )}
         {currentStep === 4 && !conversionResult && !isProcessing && (
             <Card>
                 <CardHeader><CardTitle className="text-center">Resultado</CardTitle></CardHeader>
                 <CardContent><p className="text-muted-foreground text-center">A conversão ainda não foi realizada. Por favor, complete as etapas anteriores.</p></CardContent>
             </Card>
         )}
      </div>

      {currentStep > 1 && currentStep < STEPS.length && (
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={handlePreviousStep} disabled={isProcessing}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Anterior
          </Button>
          <Button 
            onClick={handleNextStep} 
            disabled={isProcessing || (currentStep > 1 && !parsedData)}
          >
            {isProcessing && currentStep === STEPS.length - 1 ? ( 
                <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Convertendo... </>
            ) : isProcessing ? ( 
                <> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando... </>
            ) : currentStep === STEPS.length - 1 ? ( 
                <> <Download className="mr-2 h-5 w-5" /> Converter e Gerar Arquivo </>
            ) : ( 
                <> Próximo <ArrowRight className="ml-2 h-5 w-5" /> </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
