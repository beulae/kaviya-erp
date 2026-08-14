import * as React from 'react'
import { Upload } from 'lucide-react'
import { Field } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { SignaturePad } from './signature-pad'
import { SIGNATURE_METHOD_OPTIONS, SIGNATURE_ACCEPTED_TYPES } from '../constants/options'
import type { SignatureMethod } from '@/types/profile'

interface ProfileSignatureSectionProps {
  signatureMethod: SignatureMethod
  onSignatureMethodChange: (method: SignatureMethod) => void
  signaturePad?: string
  onSignaturePadChange: (dataUrl: string) => void
  signatureFile?: File
  onSignatureFileChange: (file: File | undefined) => void
  existingSignatureUrl?: string
  padError?: string
  fileError?: string
}

export function ProfileSignatureSection({
  signatureMethod,
  onSignatureMethodChange,
  signaturePad,
  onSignaturePadChange,
  signatureFile,
  onSignatureFileChange,
  existingSignatureUrl,
  padError,
  fileError,
}: ProfileSignatureSectionProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [filePreview, setFilePreview] = React.useState<string | undefined>()

  React.useEffect(() => {
    if (!signatureFile) {
      setFilePreview(undefined)
      return
    }
    const url = URL.createObjectURL(signatureFile)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [signatureFile])

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">Signature Method</legend>
        <div className="flex flex-wrap gap-4">
          {SIGNATURE_METHOD_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
              <input
                type="radio"
                name="signatureMethod"
                value={opt.value}
                checked={signatureMethod === opt.value}
                onChange={() => onSignatureMethodChange(opt.value as SignatureMethod)}
                className="h-4 w-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {signatureMethod === 'pad' && (
        <Field label="Sign Here" htmlFor="signaturePad" error={padError}>
          <SignaturePad value={signaturePad} onChange={onSignaturePadChange} error={!!padError} />
        </Field>
      )}

      {signatureMethod === 'upload' && (
        <Field label="Upload Signature" htmlFor="signatureFile" error={fileError}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              {filePreview ? (
                <img src={filePreview} alt="Signature preview" className="h-full w-full object-contain" />
              ) : (
                <span className="text-xs text-[var(--color-muted-foreground)]">No file selected</span>
              )}
            </div>
            <div>
              <input
                ref={fileInputRef}
                id="signatureFile"
                type="file"
                accept={SIGNATURE_ACCEPTED_TYPES.join(',')}
                className="hidden"
                onChange={(e) => onSignatureFileChange(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> {filePreview ? 'Replace File' : 'Choose File'}
              </Button>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">PNG or JPG, up to 2 MB.</p>
            </div>
          </div>
        </Field>
      )}

      {existingSignatureUrl && (
        <div>
          <p className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">Previous E-Signature</p>
          <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
            <img src={existingSignatureUrl} alt="Previous signature" className="h-full w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
