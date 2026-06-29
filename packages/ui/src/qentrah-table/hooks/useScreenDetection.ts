"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type ScreenVisibility = "above" | "visible" | "below" | "offscreen"

export interface UseScreenDetectionOptions {
  /** Selector (within `rootRef`) to observe. Defaults to "*". */
  selector?: string
  /** Pixels of margin around the root for early visibility detection. */
  rootMargin?: string
  /** Polling interval fallback for browsers without IntersectionObserver. */
  pollMs?: number
  /** The scrollable root element. Defaults to `document.scrollingElement`. */
  rootRef?: React.RefObject<HTMLElement | null>
  /** Disable the observer (e.g. when the consumer is unmounted). */
  enabled?: boolean
}

export interface UseScreenDetectionResult {
  /** Map of observed element id → visibility state. */
  visibility: Map<string, ScreenVisibility>
  /** True when the element with this id is currently in the viewport. */
  isVisible: (id: string) => boolean
  /** Programmatically scroll the given element into view (smooth). */
  scrollIntoView: (id: string, opts?: ScrollIntoViewOptions) => void
  /** Manually re-observe (useful after a long virtualised list re-render). */
  refresh: () => void
}

/**
 * Track which elements in a scrollable list are currently inside the
 * viewport. Designed for long AG Grid tables and kanban boards so
 * consumers can show a "scroll to row" hint or auto-scroll when the
 * user triggers an action on a row that is currently off-screen.
 *
 * Usage:
 *   const ref = useRef<HTMLDivElement>(null)
 *   const screen = useScreenDetection({ rootRef: ref, rootMargin: "-40px" })
 *   ...
 *   <div ref={ref} className="overflow-auto">
 *     {rows.map(row => (
 *       <div key={row.id} data-screen-id={row.id}>...</div>
 *     ))}
 *   </div>
 *   ...
 *   {screen.isVisible(row.id) ? null : (
 *     <button onClick={() => screen.scrollIntoView(row.id)}>
 *       Scroll to row
 *     </button>
 *   )}
 */
export function useScreenDetection(
  options: UseScreenDetectionOptions = {},
): UseScreenDetectionResult {
  const {
    selector = "*",
    rootMargin = "0px",
    pollMs = 250,
    rootRef,
    enabled = true,
  } = options

  const [visibility, setVisibility] = useState<Map<string, ScreenVisibility>>(
    () => new Map(),
  )
  const internalRootRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const pollHandleRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // Cache of elements we've attached, keyed by id, so refresh() can re-attach.
  const elementsRef = useRef<Map<string, HTMLElement>>(new Map())
  // Cached viewport rect for the fallback poll path.
  const viewportRef = useRef<{ top: number; bottom: number } | null>(null)

  const getRoot = useCallback((): HTMLElement | null => {
    if (rootRef?.current) return rootRef.current
    if (internalRootRef.current) return internalRootRef.current
    if (typeof document === "undefined") return null
    return (document.scrollingElement as HTMLElement | null) ?? document.documentElement
  }, [rootRef])

  const compute = useCallback(() => {
    if (typeof window === "undefined") return
    const root = getRoot()
    if (!root) return
    const rect = root.getBoundingClientRect()
    const top = rect.top
    const bottom = rect.bottom
    if (
      viewportRef.current &&
      viewportRef.current.top === top &&
      viewportRef.current.bottom === bottom
    ) {
      return
    }
    viewportRef.current = { top, bottom }
    setVisibility((prev) => {
      const next = new Map(prev)
      let changed = false
      elementsRef.current.forEach((el, id) => {
        const r = el.getBoundingClientRect()
        const state: ScreenVisibility =
          r.bottom < top
            ? "above"
            : r.top > bottom
              ? "below"
              : r.width === 0 && r.height === 0
                ? "offscreen"
                : "visible"
        if (prev.get(id) !== state) {
          next.set(id, state)
          changed = true
        }
      })
      return changed ? next : prev
    })
  }, [getRoot])

  const attach = useCallback(() => {
    if (typeof window === "undefined") return
    const root = getRoot()
    if (!root) return
    // First, scan for elements.
    const targets = Array.from(root.querySelectorAll<HTMLElement>(selector))
    const next = new Map<string, HTMLElement>()
    targets.forEach((el) => {
      const id =
        el.dataset.screenId ||
        el.getAttribute("data-screen-id") ||
        el.id ||
        ""
      if (id) next.set(id, el)
    })
    elementsRef.current = next

    // Disconnect any previous observer.
    observerRef.current?.disconnect()
    observerRef.current = null

    if (typeof IntersectionObserver !== "undefined") {
      const obs = new IntersectionObserver(
        (entries) => {
          setVisibility((prev) => {
            const next = new Map(prev)
            let changed = false
            for (const entry of entries) {
              const id =
                (entry.target as HTMLElement).dataset.screenId ||
                (entry.target as HTMLElement).id
              if (!id) continue
              const state: ScreenVisibility = entry.isIntersecting
                ? "visible"
                : entry.boundingClientRect.bottom < (entry.rootBounds?.top ?? 0)
                  ? "above"
                  : "below"
              if (prev.get(id) !== state) {
                next.set(id, state)
                changed = true
              }
            }
            return changed ? next : prev
          })
        },
        { root, rootMargin, threshold: [0, 0.01, 0.5, 1] },
      )
      targets.forEach((el) => obs.observe(el))
      observerRef.current = obs
    } else {
      // Fallback: poll on an interval.
      pollHandleRef.current = setInterval(compute, pollMs)
    }
    compute()
  }, [compute, getRoot, pollMs, rootMargin, selector])

  // Attach on mount and whenever the enabled flag or selector changes.
  useEffect(() => {
    if (!enabled) return
    attach()
    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (pollHandleRef.current) {
        clearInterval(pollHandleRef.current)
        pollHandleRef.current = null
      }
    }
  }, [attach, enabled])

  // Keep the visibility map roughly fresh on resize / scroll.
  useEffect(() => {
    if (!enabled) return
    const onChange = () => compute()
    window.addEventListener("scroll", onChange, { passive: true, capture: true })
    window.addEventListener("resize", onChange)
    return () => {
      window.removeEventListener("scroll", onChange, { capture: true } as any)
      window.removeEventListener("resize", onChange)
    }
  }, [compute, enabled])

  const isVisible = useCallback(
    (id: string) => visibility.get(id) === "visible",
    [visibility],
  )

  const scrollIntoView = useCallback(
    (id: string, opts: ScrollIntoViewOptions = { behavior: "smooth", block: "center" }) => {
      const el = elementsRef.current.get(id)
      if (el) el.scrollIntoView(opts)
    },
    [],
  )

  const refresh = useCallback(() => {
    attach()
  }, [attach])

  return { visibility, isVisible, scrollIntoView, refresh }
}

export default useScreenDetection
