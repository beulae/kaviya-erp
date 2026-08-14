import * as React from 'react'
import { Upload, Trash2, ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LOGO_ACCEPTED_TYPES } from '../constants/options'

interface ProfileLogoUploadProps {
  existingLogoUrl?: string
  file?: File
  onFileChange: (file: File | undefined) => void
  onDelete: () => void
  isDeleting?: boolean
  error?: string
}

export function ProfileLogoUpload({
  existingLogoUrl,
  file,
  onFileChange,
  onDelete,
  isDeleting,
  error,
}: ProfileLogoUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(existingLogoUrl)

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(existingLogoUrl)
      return
    }
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file, existingLogoUrl])

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    onFileChange(selected)
  }

  return (
    <div>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)]">
          {previewUrl ? (
            <img src={previewUrl} alt="Company logo" className="h-full w-full object-contain" />
          ) : (
            <ImageOff className="h-6 w-6 text-[var(--color-muted-foreground)]" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="logoFile"
              type="file"
              accept={LOGO_ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={handleSelect}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" /> {previewUrl ? 'Replace Logo' : 'Upload Logo'}
            </Button>
            {previewUrl && (
              <Button type="button" variant="outline" size="sm" onClick={onDelete} loading={isDeleting}>
                <Trash2 className="h-4 w-4" /> Delete Logo
              </Button>
            )}
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">PNG, JPG or WEBP, up to 2 MB.</p>
          {error && <p className="text-xs text-[var(--color-danger)]">{error}</p>}
        </div>
      </div>
    </div>
  )
}
