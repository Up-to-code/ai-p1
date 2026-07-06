"use client";

import { useMemo } from "react";
import { useCustomFieldDefinitionsQuery, useCustomFieldValuesQuery, type CustomFieldDefinition, type CustomFieldValue } from "@/domains/custom-fields/api/custom-fields";
import { CustomFieldRenderer } from "./custom-field-renderer";
import { Settings } from "lucide-react";
import { Link } from "@/i18n/routing";

interface CustomFieldsSectionProps {
  recordType: string;
  recordId: string;
  editable?: boolean;
}

export function CustomFieldsSection({ recordType, recordId, editable = true }: CustomFieldsSectionProps) {
  const definitionsQuery = useCustomFieldDefinitionsQuery(recordType);
  const valuesQuery = useCustomFieldValuesQuery(recordType, recordId);

  const definitions = useMemo(() => (definitionsQuery.data as any)?.definitions ?? [], [definitionsQuery.data]);
  const values = useMemo(() => (valuesQuery.data as any)?.values ?? [], [valuesQuery.data]);

  const valueMap = useMemo(() => {
    const map = new Map<string, CustomFieldValue>();
    for (const v of values) {
      map.set(v.fieldKey, v);
    }
    return map;
  }, [values]);

  const visibleDefinitions = useMemo(
    () => definitions.filter((d: CustomFieldDefinition) => d.display?.detailVisible !== false),
    [definitions],
  );

  if (definitionsQuery.isLoading) {
    return (
      <div className="py-4">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  if (visibleDefinitions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">No custom fields configured.</p>
        <Link
          href="/organization?tab=profile"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <Settings className="h-3 w-3" />
          Add custom fields in settings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {visibleDefinitions.map((definition: CustomFieldDefinition) => (
        <CustomFieldRenderer
          key={definition.id}
          definition={definition}
          value={valueMap.get(definition.key)}
          recordType={recordType}
          recordId={recordId}
          editable={editable}
        />
      ))}
    </div>
  );
}
