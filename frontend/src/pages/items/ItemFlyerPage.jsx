import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { useParams } from 'react-router-dom'
import { useItem } from '../../services/itemsApi'

export function ItemFlyerPage() {
  const { id } = useParams()
  const { data: item, isLoading } = useItem(id)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  const itemUrl = `${window.location.origin}/items/${id}`

  useEffect(() => {
    QRCode.toDataURL(itemUrl, { width: 240, margin: 1 }).then(setQrDataUrl).catch(() => {})
  }, [itemUrl])

  if (isLoading) return <p className="text-slate-500">Loading…</p>
  if (!item) return <p className="text-red-600">This item could not be found.</p>

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Print flyer
        </button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center print:border-0 print:shadow-none">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
          {item.type === 'LOST' ? 'Lost' : 'Found'} Item
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{item.title}</h1>
        <p className="mt-4 text-slate-700">{item.description}</p>

        <dl className="mt-6 space-y-1 text-sm text-slate-600">
          <div>
            <dt className="inline font-medium">Category:</dt> <dd className="inline">{item.category?.name}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Location:</dt> <dd className="inline">{item.location?.name}</dd>
          </div>
          <div>
            <dt className="inline font-medium">Date:</dt>{' '}
            <dd className="inline">{new Date(item.eventDate).toLocaleDateString()}</dd>
          </div>
        </dl>

        {qrDataUrl && (
          <div className="mt-8 flex flex-col items-center">
            <img src={qrDataUrl} alt={`QR code linking to the CampusFind listing for ${item.title}`} className="h-40 w-40" />
            <p className="mt-2 text-xs text-slate-500">Scan to view this listing on CampusFind</p>
          </div>
        )}
      </div>
    </div>
  )
}
