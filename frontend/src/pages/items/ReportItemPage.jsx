import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { reportItemSchema } from '../../schemas/itemSchemas'
import { useCategories, useCreateItem, useLocations, useUploadItemImages } from '../../services/itemsApi'

const MAX_IMAGES = 5

export function ReportItemPage() {
  const { data: categories } = useCategories()
  const { data: locations } = useLocations()
  const createItem = useCreateItem()
  const uploadImages = useUploadItemImages()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState(null)
  const [images, setImages] = useState([])
  const [imagesTruncated, setImagesTruncated] = useState(false)
  const today = new Date().toISOString().slice(0, 10)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(reportItemSchema), defaultValues: { type: 'LOST' } })
  const descriptionValue = watch('description', '')

  function handleImagesChange(e) {
    const selected = Array.from(e.target.files ?? [])
    setImagesTruncated(selected.length > MAX_IMAGES)
    setImages(selected.slice(0, MAX_IMAGES))
  }

  async function onSubmit(values) {
    setServerError(null)
    try {
      const item = await createItem.mutateAsync(values)
      if (images.length > 0) {
        // Images upload as a second step after the item exists — if this
        // fails, the report itself still succeeded, so still navigate there
        // rather than losing the whole submission over an image hiccup.
        await uploadImages.mutateAsync({ itemId: item.id, files: images }).catch(() => {})
      }
      navigate(`/items/${item.id}`)
    } catch (err) {
      setServerError(err.response?.data?.error?.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Report an item</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <span className="block text-sm font-medium text-slate-700">Type</span>
          <div className="mt-1 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="LOST" {...register('type')} /> Lost
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" value="FOUND" {...register('type')} /> Found
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
          <input
            id="title"
            autoFocus
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('title')}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Category</label>
          <select
            id="categoryId"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('categoryId')}
          >
            <option value="">Select a category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
        </div>

        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-slate-700">Location</label>
          <select
            id="locationId"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('locationId')}
          >
            <option value="">Select a location</option>
            {locations?.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          {errors.locationId && <p className="mt-1 text-sm text-red-600">{errors.locationId.message}</p>}
        </div>

        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700">Date</label>
          <input
            id="eventDate"
            type="date"
            max={today}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('eventDate')}
          />
          {errors.eventDate && <p className="mt-1 text-sm text-red-600">{errors.eventDate.message}</p>}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
            <span className="text-xs text-slate-400">{descriptionValue.length}/2000</span>
          </div>
          <textarea
            id="description"
            rows={4}
            maxLength={2000}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            {...register('description')}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="images" className="block text-sm font-medium text-slate-700">
            Photos (optional, up to {MAX_IMAGES})
          </label>
          <input
            id="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImagesChange}
            className="mt-1 w-full text-sm"
          />
          {images.length > 0 && (
            <p className="mt-1 text-xs text-slate-500">{images.length} photo(s) selected</p>
          )}
          {imagesTruncated && (
            <p className="mt-1 text-xs text-amber-600">Only the first {MAX_IMAGES} photos will be uploaded.</p>
          )}
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  )
}
