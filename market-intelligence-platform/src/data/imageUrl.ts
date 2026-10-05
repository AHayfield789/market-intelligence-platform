import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanityClient'

const builder = imageUrlBuilder(sanityClient)

// Derive the image-source type from the builder so we don't depend on a deep
// internal import path (which varies between @sanity/image-url versions).
export type ImageSource = Parameters<typeof builder.image>[0]

/** Build a CDN URL for a Sanity image source (resize/crop/format on the fly). */
export function urlFor(source: ImageSource) {
  return builder.image(source)
}
