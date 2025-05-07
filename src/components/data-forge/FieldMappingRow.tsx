
"use client";

import type {ChangeEvent} from 'react';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue} from '@/components/ui/select';
import {TableCell, TableRow} from '@/components/ui/table';
import type {
  DetectedHeader,
  FieldMapping,
  DataType,
  MappedFieldTarget,
  UserManagedField,
  GroupedFields,
} from '@/types';
import {DATA_TYPES, NO_MAPPING_VALUE} from '@/types';
import {Switch} from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils'; // Import cn utility


interface FieldMappingRowProps {
  header: DetectedHeader;
  mapping: FieldMapping;
  groupedUserManagedFields: GroupedFields;
  userManagedFields: UserManagedField[];
  onMappingChange: (originalHeaderId: string, fieldName: keyof FieldMapping, value: any) => void;
}

export function FieldMappingRow({
  header,
  mapping,
  groupedUserManagedFields,
  userManagedFields,
  onMappingChange,
}: FieldMappingRowProps) {

  const handleFieldTargetChange = (value: MappedFieldTarget | string) => {
    const targetValue = value as MappedFieldTarget;
    onMappingChange(mapping.originalHeaderId, 'mappedTo', targetValue); // Use mapping.originalHeaderId

    const selectedField = userManagedFields.find(f => f.name === targetValue);
    if (targetValue === NO_MAPPING_VALUE || targetValue === "" || !selectedField) {
        onMappingChange(mapping.originalHeaderId, 'dataType', ""); // Use mapping.originalHeaderId
    } else {
        onMappingChange(mapping.originalHeaderId, 'dataType', selectedField.type); // Use mapping.originalHeaderId
    }
  };

  const handleDataTypeChange = (value: DataType | string) => {
    onMappingChange(mapping.originalHeaderId, 'dataType', value as DataType); // Use mapping.originalHeaderId
  };

  const handleRemoveMaskChange = (checked: boolean) => {
    onMappingChange(mapping.originalHeaderId, 'removeMask', checked); // Use mapping.originalHeaderId
  };

  const selectedMappedField = userManagedFields.find(f => f.name === mapping.mappedTo);

  // Removed extra whitespace between TableCell components
  return (
    <TableRow><TableCell className={cn("font-medium sticky left-0 bg-card z-10 whitespace-nowrap")}>{header.name}</TableCell><TableCell><div className="flex items-center space-x-2"><Select value={mapping.mappedTo || NO_MAPPING_VALUE} onValueChange={handleFieldTargetChange}><SelectTrigger className="flex-grow min-w-[180px]"><SelectValue placeholder="Selecione um campo" /></SelectTrigger><SelectContent>{Object.entries(groupedUserManagedFields).map(([groupName, fields]) => (groupName === NO_MAPPING_VALUE ? (<SelectItem key={NO_MAPPING_VALUE} value={NO_MAPPING_VALUE}>{NO_MAPPING_VALUE}</SelectItem>) : (<SelectGroup key={groupName}><SelectLabel>{groupName}</SelectLabel>{fields?.map(field => (<SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>))}</SelectGroup>)))}</SelectContent></Select>{selectedMappedField && selectedMappedField.comment && (<Tooltip><TooltipTrigger asChild><HelpCircle className="h-5 w-5 text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>{selectedMappedField.comment}</p></TooltipContent></Tooltip>)}</div></TableCell><TableCell><Select value={mapping.dataType || ""} onValueChange={handleDataTypeChange} disabled={mapping.mappedTo === NO_MAPPING_VALUE || !mapping.mappedTo}><SelectTrigger className="min-w-[120px]"><SelectValue placeholder="Tipo de dado" /></SelectTrigger><SelectContent>{DATA_TYPES.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent></Select></TableCell><TableCell><div className="flex items-center justify-center"><Switch id={`remove-mask-${header.id}`} checked={mapping.removeMask || false} onCheckedChange={handleRemoveMaskChange} disabled={mapping.mappedTo === NO_MAPPING_VALUE || !mapping.mappedTo}/></div></TableCell></TableRow>
  );
}

