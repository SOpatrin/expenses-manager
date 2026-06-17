'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { type ScanReceiptState, scanReceiptAction } from '../actions'
import type { ReceiptDraft } from '@/lib/receipts'

function isHeic(file: File): boolean {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)
  )
}

async function toJpegBlob(file: File): Promise<Blob> {
  if (!isHeic(file)) return file
  const heic2any = (await import('heic2any')).default
  const result = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: 0.9,
  })
  return Array.isArray(result) ? result[0] : result
}

function compressBlob(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onerror = () =>
        reject(
          new Error(
            'Поддерживаются HEIC, JPEG, PNG, WebP. Попробуйте другой файл.',
          ),
        )
      img.onload = () => {
        const maxSize = 1200
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas
          .getContext('2d')!
          .drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = dataUrl
    }
    reader.readAsDataURL(blob)
  })
}

async function compressImage(file: File): Promise<string> {
  const blob = await toJpegBlob(file)
  return compressBlob(blob)
}

export default function ReceiptScanButton({
  walletId,
  onScanSuccess,
  disabled,
}: {
  walletId: string
  onScanSuccess: (draft: ReceiptDraft) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [scanState, submitScan] = useActionState<ScanReceiptState, FormData>(
    scanReceiptAction.bind(null, walletId),
    { status: 'idle' },
  )

  useEffect(() => {
    if (scanState.status === 'success') {
      onScanSuccess(scanState.data)
    } else if (scanState.status === 'error') {
      toast.error(scanState.message)
    }
  }, [scanState, onScanSuccess])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // reset so the same file can be picked again
    e.target.value = ''

    let image: string
    setIsCompressing(true)
    try {
      image = await compressImage(file)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Не удалось обработать изображение',
      )
      return
    } finally {
      setIsCompressing(false)
    }
    const fd = new FormData()
    fd.set('image', image)
    startTransition(() => submitScan(fd))
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        size="icon"
        variant="outline"
        disabled={disabled || isCompressing || isPending}
        onClick={() => inputRef.current?.click()}
        title="Сканировать чек"
      >
        {isCompressing || isPending ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Camera />
        )}
      </Button>
    </>
  )
}
