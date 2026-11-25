export const en = {
  meta: {
    title: "Parbin - Tech meetups in Panama",
  },
  common: {
    appName: "Parbin",
    tagline: "Tech meetups in Panamá",
    menu: "Menu",
    loading: "Loading…",
    working: "Working…",
    refresh: "Refresh",
    cancel: "Cancel",
    preview: "Preview",
    language: "Language",
    changeLanguage: "Change language",
    spanish: "Español",
    english: "English",
    signedInAs: "Signed in as {{email}}",
    somethingWentWrong: "Something went wrong.",
    githubRepository: "Open the Parbin GitHub repository",
  },
  nav: {
    upcoming: "Upcoming",
    upcomingDescription: "Events and the monthly calendar",
    pastEvents: "Past events",
    pastEventsDescription: "Events that already took place",
    admin: "Admin",
    adminDescription: "Create events and review suggestions",
    dashboard: "Dashboard",
    dashboardDescription: "Catalog and moderation charts",
    suggest: "Suggest an event",
    suggestDescription: "Send a meetup for review",
  },
  status: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
  },
  weekdays: {
    sun: "Sun",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
  },
  pages: {
    events: {
      nextEvents: "Next Events",
      highlightingDay: "Highlighting the events on this day.",
      showAll: "Show all",
      loading: "Loading events…",
      empty:
        "No upcoming events yet. Know of one? Suggest it from the top bar.",
    },
    pastEvents: {
      title: "Past events",
      description: "The ten most recent events that already took place.",
      filterLabel: "Filter past events by tag",
      allTags: "All tags",
      loading: "Loading past events…",
      error: "Failed to load past events.",
      empty: "No past events yet.",
    },
    suggest: {
      title: "Suggest an event",
      description:
        "Know about a meetup that isn't listed? Send it over. An admin reviews every suggestion before it goes live.",
      formTitle: "Event details",
      formDescription: "Fields marked with * are required.",
      submit: "Send for review",
    },
    admin: {
      title: "Admin",
      signedInDescription:
        "Signed in as {{email}}. Create events and review community suggestions.",
      dashboard: "Dashboard",
      signingOut: "Signing out…",
      signOut: "Sign out",
      createTitle: "Create an event",
      createDescription: "Published right away to the public feed.",
      publish: "Publish event",
      reviewQueue: "Review queue",
      reviewDescription:
        "Approving a suggestion turns it into a published event.",
      loadingSuggestions: "Loading suggestions…",
      emptySuggestions: "Nothing to review right now.",
      noLocation: "No location provided",
      noDescription: "No description provided.",
      approve: "Approve",
      reject: "Reject",
      previewTitle: "Event preview",
      previewHint:
        "This is how the suggestion will appear on the public event page. Approve to publish it or reject to discard it.",
      previewClose: "Close preview",
    },
    eventDetails: {
      allEvents: "All events",
      loading: "Loading event…",
      notAvailableTitle: "Event not available",
      notAvailableDescription:
        "This event could not be found. It may have been removed or the link is no longer valid.",
      backToAll: "Back to all events",
      titleLabel: "Title *",
      titlePlaceholder: "Event title",
      edit: "Edit",
      descriptionLabel: "Description",
      descriptionPlaceholder: "What's happening, who it's for…",
      starts: "Starts *",
      ends: "Ends *",
      location: "Location",
      locationPlaceholder: "Venue, neighborhood",
      eventPage: "Event page",
      eventPagePlaceholder: "https://… (optional)",
      tags: "Tags",
      imageUrl: "Image URL",
      saving: "Saving…",
      saveChanges: "Save changes",
      cancel: "Cancel",
      originalListing: "Original listing",
      addToGoogle: "Add to Google Calendar",
      addToGoogleHint: "Opens with the date, time and place filled in",
      downloadIcs: "Download .ics file",
      downloadIcsHint: "For Apple Calendar, Outlook or any calendar app",
      about: "About this event",
    },
    login: {
      title: "Sign in",
      description: "Admin access is required for this page.",
      email: "Email",
      password: "Password",
      signingIn: "Signing in…",
      signIn: "Sign in",
    },
  },
  calendar: {
    nothingScheduled: "Nothing scheduled this month yet.",
    eventCount_one: "{{count}} event this month",
    eventCount_other: "{{count}} events this month",
    today: "Today",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    more: "+{{count}} more",
    hasEvents: "Has events",
    selectedDay: "Selected day",
    swipeHint: "Swipe or use the arrows to change months",
    dayAria_one: "{{date}}, {{count}} event",
    dayAria_other: "{{date}}, {{count}} events",
  },
  eventCard: {
    addToCalendar: "Add to calendar",
  },
  eventForm: {
    titleLabel: "Title *",
    titlePlaceholder: "Panamá JS Meetup #42",
    descriptionLabel: "Description",
    descriptionPlaceholder:
      "What's happening, who it's for, anything to bring…",
    starts: "Starts *",
    ends: "Ends *",
    location: "Location",
    locationPlaceholder: "Venue, neighborhood",
    eventPage: "Event page",
    eventPagePlaceholder: "https://… (optional)",
    eventPageHint: "Link to the original listing, e.g. Meetup or Eventbrite.",
    tags: "Tags",
    imageUrl: "Image URL",
    previewAlt: "Preview",
    working: "Working…",
  },
  tagInput: {
    searchOrCreate: "Search or create a tag",
    searchExisting: "Search existing tags",
    addTag: "Add tag",
    removeTag: "Remove {{tag}}",
    create: 'Create "{{name}}"',
    noMatches: "No matching tags.",
    hintCreate:
      "Select up to {{count}} tags. New names are created when you save.",
    hintSelect: "Select up to {{count}} tags from the catalog.",
    limitReached: "Limit reached.",
  },
  dashboard: {
    title: "Dashboard",
    description: "Catalog and moderation at a glance.",
    descriptionWithTimezone:
      "Catalog and moderation at a glance · {{timezone}}",
    admin: "Admin",
    refresh: "Refresh",
    loading: "Loading dashboard…",
    unavailable: "The dashboard is unavailable.",
    publishedEvents: "Published events",
    upcomingPastHint: "{{upcoming}} upcoming · {{past}} past",
    pendingReview: "Pending review",
    totalSuggestions: "{{count}} total suggestions",
    approvalRate: "Approval rate",
    approvedRejected: "{{approved}} approved · {{rejected}} rejected",
    avgReviewTime: "Avg. review time",
    fromSuggestionToDecision: "From suggestion to decision",
    withSourceLink: "With a source link",
    addedManually: "{{count}} added manually",
  },
  charts: {
    noData: "No data yet",
    events: "Events",
    moderation: "Moderation",
    suggestionStatus: "Suggestion status",
    suggestionStatusDescription:
      "Pending queue versus approved and rejected proposals.",
    sources: "Sources",
    catalogSourceMix: "Catalog source mix",
    catalogSourceMixDescription:
      "Published events with an external source URL versus manually entered ones.",
    calendar: "Calendar",
    eventsByMonth: "Events by start month",
    eventsByMonthDescription:
      "Meetup volume over the last 12 months in {{timezone}}.",
    review: "Review",
    suggestionsSubmitted: "Suggestions submitted",
    suggestionsSubmittedDescription:
      "Monthly intake from the public form and scraper, stacked by review outcome.",
    topics: "Topics",
    eventsByTag: "Events by tag",
    eventsByTagDescription: "Most common tags on published meetups.",
    places: "Places",
    topLocations: "Top locations",
    topLocationsDescription:
      "Where Panama tech meetups are listed as happening.",
    schedule: "Schedule",
    startWeekday: "Start weekday",
    startWeekdayDescription:
      "Which days of the week published events typically begin.",
    suggestionSourceMix: "Suggestion source mix",
    suggestionSourceMixDescription:
      "Proposals with a source event page (scraper or pasted URL) versus community-only submissions.",
    sourced: "Sourced",
    manual: "Manual",
    community: "Community",
    eventsByTagAria: "Published events by tag",
    eventsByMonthAria: "Published events by start month",
  },
  notices: {
    eventPublished: "Event published.",
    suggestionSubmitted: "Suggestion submitted for review.",
    signedIn: "Signed in.",
    signedOut: "Signed out.",
    suggestionApproved: "Suggestion converted into an event.",
    suggestionRejected: "Suggestion rejected.",
    eventUpdated: "Event updated.",
  },
  legal: {
    updated: "Last updated: {{date}}",
    backToEvents: "Back to events",
    contact: {
      heading: "Contact",
      body: "Parbin does not have a support inbox yet. Questions about this page, or requests about your data, can be opened as an issue in the public repository.",
      link: "Open an issue on GitHub",
    },
    privacy: {
      title: "Privacy policy",
      description:
        "What Parbin collects, why we collect it, and how to exercise your rights.",
      sections: {
        overview: {
          heading: "In short",
          paragraphs: [
            "Parbin is a public listing of technology meetups in Panama. It is intended for people in Panama, and you do not need an account to browse events or to suggest one.",
            "We keep only the data needed to publish events, moderate suggestions and understand how the site is used. We do not sell personal data, and Parbin is not directed at children.",
          ],
        },
        data: {
          heading: "What we collect",
          bullets: [
            "Event suggestions: the title, description, dates, location, image URL, tags and source page URL you submit. We do not ask for your name, email address or an account, so a suggestion is not linked to your identity.",
            "Admin sign-in: the email address of site administrators, a hashed password and an HTTP-only session cookie. Only admins sign in; there are no public accounts.",
            "Usage analytics: in production, PostHog records page views and product events such as suggestions, calendar actions and admin actions, together with device and browser details and an approximate location derived from your IP address.",
            "Server logs: the backend and hosting provider keep standard request logs that may include IP address, time and the requested path, used for security and troubleshooting.",
            "Browser storage: your language choice is saved locally as parbin.language.",
          ],
        },
        purposes: {
          heading: "Why we use it",
          paragraphs: [
            "We use this data to publish and moderate events, keep admin sessions secure, understand which parts of the site are useful, and keep the service available.",
            "We do not use it for advertising or profiling, and we do not sell or rent it.",
          ],
        },
        cookies: {
          heading: "Cookies and local storage",
          bullets: [
            "parbin_session: an HTTP-only session cookie, set only after an admin signs in.",
            "Analytics identifiers: when PostHog is enabled, it stores a random identifier in cookies and local storage to count visits and events.",
            "parbin.language: your language preference, stored locally in your browser.",
            "No advertising or cross-site tracking cookies are used.",
          ],
        },
        sharing: {
          heading: "Who we share it with",
          bullets: [
            "PostHog, our analytics provider, hosted in the United States by default, which receives the usage data described above.",
            "Our hosting and database providers, which process requests and store the event catalog.",
            "GitHub, where the source code and the public issue tracker live.",
          ],
        },
        retention: {
          heading: "How long we keep it",
          paragraphs: [
            "Suggestions stay while they are reviewed and, if published, their event content stays part of the public catalog. Server logs rotate on the hosting provider's schedule. Analytics data is kept according to the PostHog project settings. Admin accounts persist while the administrator role is active.",
          ],
        },
        rights: {
          heading: "Your rights",
          paragraphs: [
            "Panama's Ley 81 de 2019 on personal data protection gives you the rights of access, rectification, cancellation and opposition. Because suggestions do not identify you, we may not be able to locate a specific entry. If you can point us to the submission, for example with its source URL, contact us and we will act on it.",
          ],
        },
        changes: {
          heading: "Changes to this policy",
          paragraphs: [
            "If this policy changes, the date at the top of the page is updated. Significant changes will be announced on the site.",
          ],
        },
      },
    },
    terms: {
      title: "Terms of use",
      description:
        "The rules for using Parbin, its events and its suggestions.",
      sections: {
        what: {
          heading: "What Parbin is",
          paragraphs: [
            "Parbin is a free public directory of technology meetups in Panama, maintained by the Parbin project. It lists events; it does not organize them, sell tickets for them or manage them. Organizers are independent from Parbin, and using this site creates no relationship between you and them.",
          ],
        },
        info: {
          heading: "Event information",
          paragraphs: [
            "Events come from organizers, community suggestions and public event pages. Details such as dates, times, venues or speakers may be outdated or wrong. Confirm with the organizer before travelling or paying for anything. Times are shown in Panama time unless stated otherwise.",
          ],
        },
        suggestions: {
          heading: "Suggestions you send",
          paragraphs: [
            "You can suggest an event without an account. By submitting, you confirm that you have the right to share that content and you grant Parbin a non-exclusive, worldwide, royalty-free licence to store, edit, translate and publish it on Parbin and its listings.",
            "We may reject, edit or remove any suggestion, and publication is not guaranteed.",
          ],
        },
        use: {
          heading: "Acceptable use",
          bullets: [
            "Do not submit unlawful, misleading, spammy or infringing content.",
            "Do not impersonate an organizer, a venue or another person.",
            "Do not attempt to break, overload or gain unauthorized access to the service.",
            "Do not scrape the site automatically without permission.",
            "Do not use admin areas without authorization or share admin credentials.",
          ],
        },
        thirdParty: {
          heading: "Third-party content and links",
          paragraphs: [
            "Event names, logos, images and descriptions belong to their owners and appear for identification and promotion, with a link to the original listing when available. External sites, including organizers, ticketing platforms and analytics providers, have their own terms. Following external links is at your own risk.",
          ],
        },
        intellectualProperty: {
          heading: "Intellectual property",
          paragraphs: [
            "The Parbin source code is released under the MIT licence. The Parbin name, design and the compilation of the catalog are not covered by that licence. Rights in submitted content stay with their owners, subject to the licence above.",
          ],
        },
        availability: {
          heading: "Availability and changes",
          paragraphs: [
            "Parbin is offered as is and as available, without warranties of any kind. Features may change or be removed at any time, and we do not guarantee uninterrupted access.",
          ],
        },
        liability: {
          heading: "Liability",
          paragraphs: [
            "To the extent permitted by Panamanian law, Parbin is not liable for indirect or consequential damages, or for losses arising from relying on event information, attending an event, or an interruption of the service.",
          ],
        },
        law: {
          heading: "Governing law",
          paragraphs: [
            "These terms are governed by the laws of the Republic of Panama. Disputes are subject to the courts of Panama City, unless mandatory consumer rules provide otherwise.",
          ],
        },
        changes: {
          heading: "Changes to these terms",
          paragraphs: [
            "Updated terms are published on this page with a new date. Continuing to use Parbin after a change means you accept it.",
          ],
        },
      },
    },
  },
} as const
