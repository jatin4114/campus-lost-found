import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ClaimForm } from '../../components/items/ClaimForm'
import { ClaimsReview } from '../../components/items/ClaimsReview'
import { useAuth } from '../../context/AuthContext'
import { getMediaUrl } from '../../lib/apiClient'
import { useCancelClaim, useMyClaims } from '../../services/claimsApi'
import { useDeleteItemImage, useItem } from '../../services/itemsApi'

export function ItemDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: item, isLoading, isError } = useItem(id)
  const deleteImage = useDeleteItemImage()
  const { data: myClaims } = useMyClaims()
  const cancelClaim = useCancelClaim()
  const [activeIndex, setActiveIndex] = useState(0)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  if (isLoading) return <p className="text-slate-500">Loading…</p>
  if (isError || !item) return <p className="text-red-600">This item could not be found.</p>

  const isOwner = user?.id === item.userId
  const activeImage = item.images?.[activeIndex]
  // A REJECTED or CANCELLED claim shouldn't block trying again — the backend
  // itself allows resubmitting once the item is ACTIVE again (see
  // claimRepo.rejectClaim/cancelClaim reverting item status), so only a
  // still-active claim (PENDING/ACCEPTED) should hide the form.
  const myClaimOnThisItem = myClaims?.find(
    (c) => c.itemId === item.id && (c.status === 'PENDING' || c.status === 'ACCEPTED'),
  )

  async function handleCopyLink() {
    await navigator.clipboard.writeText(window.location.href)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/items" className="mb-4 inline-block text-sm text-slate-600 hover:text-slate-900">
        ← Back to browse
      </Link>

      {item.images?.length > 0 && (
        <div className="mb-6">
          <img
            src={getMediaUrl(activeImage.url)}
            alt={`Photo of ${item.title}`}
            className="aspect-video w-full rounded-lg border border-slate-200 object-cover"
          />
          <div className="mt-2 flex gap-2">
            {item.images.map((image, index) => (
              <div key={image.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`overflow-hidden rounded-md border ${
                    index === activeIndex ? 'border-slate-900' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={getMediaUrl(image.thumbnailUrl ?? image.url)}
                    alt={`Thumbnail ${index + 1} of ${item.title}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
                {isOwner && (
                  <button
                    type="button"
                    aria-label={`Delete photo ${index + 1}`}
                    onClick={() => {
                      setActiveIndex(0)
                      deleteImage.mutate({ itemId: item.id, imageId: image.id })
                    }}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-[10px] text-white"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">{item.title}</h1>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {item.type}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-3 text-sm">
        <Link to={`/items/${item.id}/flyer`} className="text-slate-600 underline">
          Print/share flyer
        </Link>
        <button type="button" onClick={handleCopyLink} className="text-slate-600 underline">
          {linkCopied ? 'Copied!' : 'Copy link'}
        </button>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-slate-700">{item.description}</p>
      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-slate-500">Category</dt>
          <dd className="text-slate-900">{item.category?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Location</dt>
          <dd className="text-slate-900">{item.location?.name}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Date</dt>
          <dd className="text-slate-900">{new Date(item.eventDate).toLocaleDateString()}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Status</dt>
          <dd className="text-slate-900">{item.status}</dd>
        </div>
      </dl>

      {!isOwner && user && item.status === 'ACTIVE' && !myClaimOnThisItem && !justSubmitted && (
        <ClaimForm itemId={item.id} onSubmitted={() => setJustSubmitted(true)} />
      )}
      {!isOwner && user && (myClaimOnThisItem || justSubmitted) && (
        <p className="mt-4 text-sm text-slate-600">
          You submitted a claim on this item
          {myClaimOnThisItem ? ` — status: ${myClaimOnThisItem.status}` : ''}.
          {myClaimOnThisItem?.status === 'PENDING' && (
            <>
              {' '}
              <button
                type="button"
                onClick={() => {
                  cancelClaim.mutate(myClaimOnThisItem.id)
                  setJustSubmitted(false)
                }}
                disabled={cancelClaim.isPending}
                className="text-slate-900 underline disabled:opacity-50"
              >
                Cancel claim
              </button>
            </>
          )}
        </p>
      )}
      {!user && item.status === 'ACTIVE' && (
        <p className="mt-4 text-sm text-slate-600">
          <Link to="/login" className="underline">
            Log in
          </Link>{' '}
          to claim this item.
        </p>
      )}

      {isOwner && <ClaimsReview itemId={item.id} />}
    </div>
  )
}
