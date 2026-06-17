'use client'

import { useActionState, useEffect, useRef } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type ScanReceiptState, scanReceiptAction } from '../actions'
import type { ReceiptDraft } from '@/lib/receipts'

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      const img = new Image()
      img.onerror = reject
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
    reader.readAsDataURL(file)
  })
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

  const [scanState, submitScan, isScanning] = useActionState<
    ScanReceiptState,
    FormData
  >(scanReceiptAction.bind(null, walletId), { status: 'idle' })

  useEffect(() => {
    if (scanState.status === 'success') {
      onScanSuccess(scanState.data)
    }
  }, [scanState, onScanSuccess])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // reset so the same file can be picked again
    e.target.value = ''

    const image = await compressImage(file)
    const fd = new FormData()
    fd.set('image', image)
    submitScan(fd)
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
        disabled={disabled || isScanning}
        onClick={() => inputRef.current?.click()}
        title={
          scanState.status === 'error' ? scanState.message : 'Сканировать чек'
        }
        className={scanState.status === 'error' ? 'border-red-500' : ''}
      >
        {isScanning ? <Loader2 className="animate-spin" /> : <Camera />}
      </Button>
    </>
  )
}
