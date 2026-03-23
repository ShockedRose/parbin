type ViewTransitionDocument = Document & {
  startViewTransition?: (updateCallback: () => Promise<void> | void) => {
    finished: Promise<void>
  }
}

export function getEventImageTransitionName(eventId: string): string {
  return `event-image-${eventId.replace(/[^a-zA-Z0-9_-]/g, "-")}`
}

export function runViewTransition(
  updateCallback: () => Promise<void> | void
): void {
  const transitionDocument = document satisfies ViewTransitionDocument

  if (typeof transitionDocument.startViewTransition === "function") {
    void transitionDocument
      .startViewTransition(updateCallback)
      .finished.catch(() => undefined)
    return
  }

  void updateCallback()
}
