import * as React from 'react'
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MAX_ARTICLES } from '../constants/options'
import type { CreateQuotationFormValues } from '../schemas/quotation-schema'

interface QuotationArticleFieldsProps {
  control: Control<CreateQuotationFormValues>
  register: UseFormRegister<CreateQuotationFormValues>
  errors: FieldErrors<CreateQuotationFormValues>
}

const EMPTY_ARTICLE = { numberOfArticle: 0, length: 0, width: 0, height: 0 }

/** One repeatable row: Number of Article / Length / Width / Height. */
function ArticleRow({
  index,
  register,
  errors,
  onRemove,
}: {
  index: number
  register: UseFormRegister<CreateQuotationFormValues>
  errors: FieldErrors<CreateQuotationFormValues>
  onRemove: () => void
}) {
  const rowErrors = errors.articles?.[index]

  return (
    <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 sm:grid-cols-[repeat(4,1fr)_auto]">
      <Field
        label="No. of Article"
        htmlFor={`articles.${index}.numberOfArticle`}
        error={rowErrors?.numberOfArticle?.message}
      >
        <Input
          id={`articles.${index}.numberOfArticle`}
          type="number"
          min={0}
          {...register(`articles.${index}.numberOfArticle`)}
        />
      </Field>
      <Field label="Length" htmlFor={`articles.${index}.length`} error={rowErrors?.length?.message}>
        <Input
          id={`articles.${index}.length`}
          type="number"
          min={0}
          step="0.01"
          {...register(`articles.${index}.length`)}
        />
      </Field>
      <Field label="Width" htmlFor={`articles.${index}.width`} error={rowErrors?.width?.message}>
        <Input
          id={`articles.${index}.width`}
          type="number"
          min={0}
          step="0.01"
          {...register(`articles.${index}.width`)}
        />
      </Field>
      <Field label="Height" htmlFor={`articles.${index}.height`} error={rowErrors?.height?.message}>
        <Input
          id={`articles.${index}.height`}
          type="number"
          min={0}
          step="0.01"
          {...register(`articles.${index}.height`)}
        />
      </Field>
      <div className="flex items-end">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          aria-label={`Remove article ${index + 1}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function QuotationArticleFields({ control, register, errors }: QuotationArticleFieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'articles' })

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[var(--color-foreground)]">Article Dimensions</h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(EMPTY_ARTICLE)}
          disabled={fields.length >= MAX_ARTICLES}
        >
          <Plus className="h-4 w-4" /> Add Article
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-muted-foreground)]">
          No articles added yet. Click "Add Article" to record dimensions.
        </p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <ArticleRow
              key={field.id}
              index={index}
              register={register}
              errors={errors}
              onRemove={() => remove(index)}
            />
          ))}
        </div>
      )}
      {fields.length >= MAX_ARTICLES && (
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">Maximum of {MAX_ARTICLES} articles reached.</p>
      )}
    </div>
  )
}
