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
  const previousSignature = existingSignatureUrl ? (
    <div>
      <p className="mb-1 text-xs font-medium text-[var(--color-muted-foreground)]">Previous E-Signature</p>
      <div className="flex h-24 w-48 items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
        <img src={existingSignatureUrl} alt="Previous signature" className="h-full w-full object-contain" />
      </div>
    </div>
  ) : null

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
        <legend className="mb-2 text-sm font-medium text-[var(--color-foreground)]">
          Update Signature Using <span className="text-[var(--color-danger)]">*</span>
        </legend>
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
        <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
          <Field label="E-Signature" htmlFor="signaturePad" error={padError} required className="max-w-md">
            <SignaturePad value={signaturePad} onChange={onSignaturePadChange} error={!!padError} />
          </Field>
          {previousSignature}
        </div>
      )}

      {signatureMethod === 'upload' && (
        <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
          <Field label="E-Signature" htmlFor="signatureFile" error={fileError} required className="max-w-md">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-24 w-48 shrink-0 items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
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
                  onChange={(e) => {
                    onSignatureFileChange(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> {filePreview ? 'Replace File' : 'Choose File'}
                </Button>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">PNG or JPG, up to 2 MB.</p>
                {signatureFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1"
                    onClick={() => onSignatureFileChange(undefined)}
                  >
                    Remove selected file
                  </Button>
                )}
              </div>
            </div>
          </Field>
          {previousSignature}
        </div>
      )}
    </div>
  )
}
