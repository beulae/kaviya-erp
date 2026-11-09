import * as React from 'react'
import { useFieldArray, type Control, type FieldErrors, type UseFormSetValue, useWatch } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { AutocompleteInput } from './autocomplete-input'
import { CITY_STATE_SUGGESTIONS } from '../constants/options'
import type { CreateQuotationFormValues } from '../schemas/quotation-schema'

interface QuotationLocationFieldsProps {
  control: Control<CreateQuotationFormValues>
  setValue: UseFormSetValue<CreateQuotationFormValues>
  errors: FieldErrors<CreateQuotationFormValues>
  name: 'fromAddresses' | 'toAddresses'
  label: string
  addLabel: string
  max: number
}

/**
 * Reusable, repeatable address field used for both pickup ("From") and
 * delivery ("To") locations — driven entirely by React Hook Form's
 * useFieldArray, with city/state autocomplete suggestions.
 */
export function QuotationLocationFields({ control, setValue, errors, name, label, addLabel, max }: QuotationLocationFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name })
  const values = useWatch({ control, name })
  const fieldErrors = errors[name]

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--color-foreground)]">{label}</h4>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} disabled={fields.length >= max}>
          <Plus className="h-4 w-4" /> {addLabel}
        </Button>
      </div>
      <div className="space-y-3">
        {fields.map((field, index) => {
          const message = fieldErrors?.[index]?.value?.message
          return (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Field label={`${label.replace(/s$/, '')} ${index + 1}`} htmlFor={`${name}.${index}.value`} error={message} required={index === 0}>
                  <AutocompleteInput
                    id={`${name}.${index}.value`}
                    placeholder="City, State"
                    value={values?.[index]?.value ?? ''}
                    onValueChange={(v) => setValue(`${name}.${index}.value`, v, { shouldValidate: true, shouldDirty: true })}
                    suggestions={CITY_STATE_SUGGESTIONS}
                  />
                </Field>
              </div>
              {fields.length > 1 && (
                <Button type="button" variant="outline" size="icon" className="mt-6" onClick={() => remove(index)} aria-label={`Remove ${label.toLowerCase()} ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
      {fields.length >= max && <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">Maximum of {max} addresses reached.</p>}
    </div>
  )
}
