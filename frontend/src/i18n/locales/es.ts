export const es = {
  meta: {
    title: "Parbin - Meetups de tecnología en Panamá",
  },
  common: {
    appName: "Parbin",
    tagline: "Meetups de tecnología en Panamá",
    menu: "Menú",
    loading: "Cargando…",
    working: "Procesando…",
    refresh: "Actualizar",
    cancel: "Cancelar",
    preview: "Vista previa",
    language: "Idioma",
    changeLanguage: "Cambiar idioma",
    spanish: "Español",
    english: "English",
    signedInAs: "Sesión iniciada como {{email}}",
    somethingWentWrong: "Algo salió mal.",
    githubRepository: "Abrir el repositorio de Parbin en GitHub",
  },
  nav: {
    upcoming: "Próximos",
    upcomingDescription: "Eventos y el calendario mensual",
    pastEvents: "Eventos pasados",
    pastEventsDescription: "Eventos que ya ocurrieron",
    admin: "Admin",
    adminDescription: "Crea eventos y revisa sugerencias",
    dashboard: "Panel",
    dashboardDescription: "Gráficas de catálogo y moderación",
    suggest: "Sugerir un evento",
    suggestDescription: "Envía un meetup para revisión",
  },
  status: {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  },
  weekdays: {
    sun: "Dom",
    mon: "Lun",
    tue: "Mar",
    wed: "Mié",
    thu: "Jue",
    fri: "Vie",
    sat: "Sáb",
  },
  pages: {
    events: {
      nextEvents: "Próximos eventos",
      highlightingDay: "Resaltando los eventos de este día.",
      showAll: "Mostrar todos",
      loading: "Cargando eventos…",
      empty:
        "Aún no hay próximos eventos. ¿Conoces uno? Sugiérelo desde la barra superior.",
    },
    pastEvents: {
      title: "Eventos pasados",
      description: "Los diez eventos más recientes que ya ocurrieron.",
      filterLabel: "Filtrar eventos pasados por etiqueta",
      allTags: "Todas las etiquetas",
      loading: "Cargando eventos pasados…",
      error: "No se pudieron cargar los eventos pasados.",
      empty: "Aún no hay eventos pasados.",
    },
    suggest: {
      title: "Sugerir un evento",
      description:
        "¿Conoces un meetup que no está en la lista? Envíalo. Un administrador revisa cada sugerencia antes de publicarla.",
      formTitle: "Detalles del evento",
      formDescription: "Los campos con * son obligatorios.",
      submit: "Enviar para revisión",
    },
    admin: {
      title: "Admin",
      signedInDescription:
        "Sesión iniciada como {{email}}. Crea eventos y revisa las sugerencias de la comunidad.",
      dashboard: "Panel",
      signingOut: "Cerrando sesión…",
      signOut: "Cerrar sesión",
      createTitle: "Crear un evento",
      createDescription: "Se publica de inmediato en el feed público.",
      publish: "Publicar evento",
      reviewQueue: "Cola de revisión",
      reviewDescription:
        "Aprobar una sugerencia la convierte en un evento publicado.",
      loadingSuggestions: "Cargando sugerencias…",
      emptySuggestions: "Nada que revisar por ahora.",
      noLocation: "Sin ubicación",
      noDescription: "Sin descripción.",
      approve: "Aprobar",
      reject: "Rechazar",
      previewTitle: "Vista previa del evento",
      previewHint:
        "Así se verá la sugerencia en la página pública del evento. Aprueba para publicarla o rechaza para descartarla.",
      previewClose: "Cerrar vista previa",
    },
    eventDetails: {
      allEvents: "Todos los eventos",
      loading: "Cargando evento…",
      notAvailableTitle: "Evento no disponible",
      notAvailableDescription:
        "No se encontró este evento. Puede que se haya eliminado o que el enlace ya no sea válido.",
      backToAll: "Volver a todos los eventos",
      titleLabel: "Título *",
      titlePlaceholder: "Título del evento",
      edit: "Editar",
      descriptionLabel: "Descripción",
      descriptionPlaceholder: "Qué sucede, para quién es…",
      starts: "Empieza *",
      ends: "Termina *",
      location: "Ubicación",
      locationPlaceholder: "Lugar, barrio",
      eventPage: "Página del evento",
      eventPagePlaceholder: "https://… (opcional)",
      tags: "Etiquetas",
      imageUrl: "URL de la imagen",
      saving: "Guardando…",
      saveChanges: "Guardar cambios",
      cancel: "Cancelar",
      originalListing: "Publicación original",
      addToGoogle: "Agregar a Google Calendar",
      addToGoogleHint: "Se abre con la fecha, hora y lugar completados",
      downloadIcs: "Descargar archivo .ics",
      downloadIcsHint:
        "Para Apple Calendar, Outlook o cualquier app de calendario",
      about: "Acerca de este evento",
    },
    login: {
      title: "Iniciar sesión",
      description: "Se requiere acceso de administrador para esta página.",
      email: "Correo electrónico",
      password: "Contraseña",
      signingIn: "Iniciando sesión…",
      signIn: "Iniciar sesión",
    },
  },
  calendar: {
    nothingScheduled: "Aún no hay nada programado este mes.",
    eventCount_one: "{{count}} evento este mes",
    eventCount_other: "{{count}} eventos este mes",
    today: "Hoy",
    previousMonth: "Mes anterior",
    nextMonth: "Mes siguiente",
    more: "+{{count}} más",
    hasEvents: "Con eventos",
    selectedDay: "Día seleccionado",
    swipeHint: "Desliza o usa las flechas para cambiar de mes",
    dayAria_one: "{{date}}, {{count}} evento",
    dayAria_other: "{{date}}, {{count}} eventos",
  },
  eventCard: {
    addToCalendar: "Agregar al calendario",
  },
  eventForm: {
    titleLabel: "Título *",
    titlePlaceholder: "Panamá JS Meetup #42",
    descriptionLabel: "Descripción",
    descriptionPlaceholder: "Qué sucede, para quién es, qué llevar…",
    starts: "Empieza *",
    ends: "Termina *",
    location: "Ubicación",
    locationPlaceholder: "Lugar, barrio",
    eventPage: "Página del evento",
    eventPagePlaceholder: "https://… (opcional)",
    eventPageHint:
      "Enlace a la publicación original, por ejemplo Meetup o Eventbrite.",
    tags: "Etiquetas",
    imageUrl: "URL de la imagen",
    previewAlt: "Vista previa",
    working: "Procesando…",
  },
  tagInput: {
    searchOrCreate: "Buscar o crear una etiqueta",
    searchExisting: "Buscar etiquetas existentes",
    addTag: "Agregar etiqueta",
    removeTag: "Quitar {{tag}}",
    create: 'Crear "{{name}}"',
    noMatches: "No hay etiquetas coincidentes.",
    hintCreate:
      "Selecciona hasta {{count}} etiquetas. Los nombres nuevos se crean al guardar.",
    hintSelect: "Selecciona hasta {{count}} etiquetas del catálogo.",
    limitReached: "Límite alcanzado.",
  },
  dashboard: {
    title: "Panel",
    description: "Catálogo y moderación de un vistazo.",
    descriptionWithTimezone:
      "Catálogo y moderación de un vistazo · {{timezone}}",
    admin: "Admin",
    refresh: "Actualizar",
    loading: "Cargando panel…",
    unavailable: "El panel no está disponible.",
    publishedEvents: "Eventos publicados",
    upcomingPastHint: "{{upcoming}} próximos · {{past}} pasados",
    pendingReview: "Pendientes de revisión",
    totalSuggestions: "{{count}} sugerencias en total",
    approvalRate: "Tasa de aprobación",
    approvedRejected: "{{approved}} aprobadas · {{rejected}} rechazadas",
    avgReviewTime: "Tiempo medio de revisión",
    fromSuggestionToDecision: "Desde la sugerencia hasta la decisión",
    withSourceLink: "Con enlace de origen",
    addedManually: "{{count}} agregados manualmente",
  },
  charts: {
    noData: "Aún no hay datos",
    events: "Eventos",
    moderation: "Moderación",
    suggestionStatus: "Estado de las sugerencias",
    suggestionStatusDescription:
      "Cola de pendientes frente a propuestas aprobadas y rechazadas.",
    sources: "Orígenes",
    catalogSourceMix: "Mezcla de orígenes del catálogo",
    catalogSourceMixDescription:
      "Eventos publicados con URL de origen externa frente a los ingresados manualmente.",
    calendar: "Calendario",
    eventsByMonth: "Eventos por mes de inicio",
    eventsByMonthDescription:
      "Volumen de meetups en los últimos 12 meses en {{timezone}}.",
    review: "Revisión",
    suggestionsSubmitted: "Sugerencias enviadas",
    suggestionsSubmittedDescription:
      "Ingresos mensuales desde el formulario público y el scraper, apilados por resultado de revisión.",
    topics: "Temas",
    eventsByTag: "Eventos por etiqueta",
    eventsByTagDescription: "Etiquetas más comunes en los meetups publicados.",
    places: "Lugares",
    topLocations: "Principales ubicaciones",
    topLocationsDescription:
      "Dónde se anuncian los meetups de tecnología en Panamá.",
    schedule: "Horario",
    startWeekday: "Día de inicio",
    startWeekdayDescription:
      "En qué días de la semana suelen comenzar los eventos publicados.",
    suggestionSourceMix: "Mezcla de orígenes de sugerencias",
    suggestionSourceMixDescription:
      "Propuestas con página de origen (scraper o URL pegada) frente a envíos solo de la comunidad.",
    sourced: "Con origen",
    manual: "Manual",
    community: "Comunidad",
    eventsByTagAria: "Eventos publicados por etiqueta",
    eventsByMonthAria: "Eventos publicados por mes de inicio",
  },
  notices: {
    eventPublished: "Evento publicado.",
    suggestionSubmitted: "Sugerencia enviada para revisión.",
    signedIn: "Sesión iniciada.",
    signedOut: "Sesión cerrada.",
    suggestionApproved: "Sugerencia convertida en evento.",
    suggestionRejected: "Sugerencia rechazada.",
    eventUpdated: "Evento actualizado.",
  },
  legal: {
    updated: "Última actualización: {{date}}",
    backToEvents: "Volver a los eventos",
    contact: {
      heading: "Contacto",
      body: "Parbin aún no tiene un buzón de soporte. Las dudas sobre esta página, o las solicitudes sobre tus datos, pueden abrirse como un issue en el repositorio público.",
      link: "Abrir un issue en GitHub",
    },
    privacy: {
      title: "Política de privacidad",
      description:
        "Qué recopila Parbin, para qué lo usamos y cómo ejercer tus derechos.",
      sections: {
        overview: {
          heading: "En resumen",
          paragraphs: [
            "Parbin es un listado público de meetups de tecnología en Panamá. Está pensado para personas en Panamá, y no necesitas una cuenta para ver eventos ni para sugerir uno.",
            "Solo conservamos los datos necesarios para publicar eventos, moderar sugerencias y entender cómo se usa el sitio. No vendemos datos personales y Parbin no está dirigido a menores de edad.",
          ],
        },
        data: {
          heading: "Qué recopilamos",
          bullets: [
            "Sugerencias de eventos: el título, la descripción, las fechas, la ubicación, la URL de la imagen, las etiquetas y la URL de la página de origen que envías. No pedimos tu nombre, correo electrónico ni una cuenta, así que una sugerencia no queda vinculada a tu identidad.",
            "Acceso de administradores: el correo electrónico de los administradores del sitio, una contraseña cifrada y una cookie de sesión HTTP-only. Solo inician sesión los administradores; no hay cuentas públicas.",
            "Analítica de uso: en producción, PostHog registra vistas de página y eventos de producto como sugerencias, acciones del calendario y acciones de administración, junto con detalles del dispositivo y del navegador y una ubicación aproximada derivada de tu dirección IP.",
            "Registros del servidor: el backend y el proveedor de hosting guardan registros estándar de solicitudes que pueden incluir la dirección IP, la hora y la ruta solicitada, usados para seguridad y diagnóstico.",
            "Almacenamiento del navegador: tu idioma se guarda localmente como parbin.language.",
          ],
        },
        purposes: {
          heading: "Para qué lo usamos",
          paragraphs: [
            "Usamos estos datos para publicar y moderar eventos, mantener seguras las sesiones de administración, entender qué partes del sitio son útiles y mantener el servicio disponible.",
            "No los usamos para publicidad ni perfilado, y no los vendemos ni alquilamos.",
          ],
        },
        cookies: {
          heading: "Cookies y almacenamiento local",
          bullets: [
            "parbin_session: una cookie de sesión HTTP-only, creada solo cuando un administrador inicia sesión.",
            "Identificadores de analítica: cuando PostHog está activo, guarda un identificador aleatorio en cookies y almacenamiento local para contar visitas y eventos.",
            "parbin.language: tu preferencia de idioma, guardada localmente en tu navegador.",
            "No se usan cookies de publicidad ni de seguimiento entre sitios.",
          ],
        },
        sharing: {
          heading: "Con quién lo compartimos",
          bullets: [
            "PostHog, nuestro proveedor de analítica, alojado en Estados Unidos por defecto, que recibe los datos de uso descritos arriba.",
            "Nuestros proveedores de hosting y base de datos, que procesan las solicitudes y guardan el catálogo de eventos.",
            "GitHub, donde viven el código fuente y el gestor público de issues.",
          ],
        },
        retention: {
          heading: "Cuánto tiempo lo conservamos",
          paragraphs: [
            "Las sugerencias se conservan mientras se revisan y, si se publican, el contenido del evento queda en el catálogo público. Los registros del servidor rotan según el calendario del proveedor de hosting. Los datos de analítica se conservan según la configuración del proyecto en PostHog. Las cuentas de administrador persisten mientras el rol esté activo.",
          ],
        },
        rights: {
          heading: "Tus derechos",
          paragraphs: [
            "La Ley 81 de 2019 de protección de datos personales de Panamá te reconoce los derechos de acceso, rectificación, cancelación y oposición. Como las sugerencias no te identifican, puede que no logremos localizar una entrada concreta. Si puedes indicarnos el envío, por ejemplo con su URL de origen, contáctanos y actuaremos en consecuencia.",
          ],
        },
        changes: {
          heading: "Cambios en esta política",
          paragraphs: [
            "Si esta política cambia, se actualiza la fecha al inicio de la página. Los cambios importantes se anunciarán en el sitio.",
          ],
        },
      },
    },
    terms: {
      title: "Términos de uso",
      description:
        "Las reglas para usar Parbin, sus eventos y sus sugerencias.",
      sections: {
        what: {
          heading: "Qué es Parbin",
          paragraphs: [
            "Parbin es un directorio público y gratuito de meetups de tecnología en Panamá, mantenido por el proyecto Parbin. Lista eventos; no los organiza, no vende entradas ni los gestiona. Los organizadores son independientes de Parbin y usar este sitio no crea ninguna relación entre tú y ellos.",
          ],
        },
        info: {
          heading: "Información de los eventos",
          paragraphs: [
            "Los eventos provienen de organizadores, sugerencias de la comunidad y páginas públicas de eventos. Datos como fechas, horas, lugares o ponentes pueden estar desactualizados o ser incorrectos. Confirma con el organizador antes de viajar o pagar algo. Las horas se muestran en hora de Panamá salvo que se indique otra cosa.",
          ],
        },
        suggestions: {
          heading: "Sugerencias que envías",
          paragraphs: [
            "Puedes sugerir un evento sin cuenta. Al enviarlo, confirmas que tienes derecho a compartir ese contenido y otorgas a Parbin una licencia no exclusiva, mundial y gratuita para almacenarlo, editarlo, traducirlo y publicarlo en Parbin y sus listados.",
            "Podemos rechazar, editar o eliminar cualquier sugerencia, y la publicación no está garantizada.",
          ],
        },
        use: {
          heading: "Uso aceptable",
          bullets: [
            "No envíes contenido ilegal, engañoso, spam o que infrinja derechos de terceros.",
            "No suplantes a un organizador, un lugar o otra persona.",
            "No intentes romper, sobrecargar u obtener acceso no autorizado al servicio.",
            "No extraigas el contenido del sitio de forma automática sin permiso.",
            "No uses las áreas de administración sin autorización ni compartas credenciales de administrador.",
          ],
        },
        thirdParty: {
          heading: "Contenido y enlaces de terceros",
          paragraphs: [
            "Los nombres de eventos, logos, imágenes y descripciones pertenecen a sus dueños y aparecen para identificación y promoción, con un enlace a la publicación original cuando está disponible. Los sitios externos, incluidos organizadores, plataformas de entradas y proveedores de analítica, tienen sus propios términos. Seguir enlaces externos es bajo tu propio riesgo.",
          ],
        },
        intellectualProperty: {
          heading: "Propiedad intelectual",
          paragraphs: [
            "El código fuente de Parbin se publica bajo la licencia MIT. El nombre Parbin, su diseño y la compilación del catálogo no están cubiertos por esa licencia. Los derechos sobre el contenido enviado siguen siendo de sus dueños, sujetos a la licencia anterior.",
          ],
        },
        availability: {
          heading: "Disponibilidad y cambios",
          paragraphs: [
            "Parbin se ofrece tal cual y según disponibilidad, sin garantías de ningún tipo. Las funciones pueden cambiar o eliminarse en cualquier momento y no garantizamos acceso ininterrumpido.",
          ],
        },
        liability: {
          heading: "Responsabilidad",
          paragraphs: [
            "En la medida permitida por la ley panameña, Parbin no responde por daños indirectos o consecuentes, ni por pérdidas derivadas de confiar en la información de un evento, asistir a un evento o una interrupción del servicio.",
          ],
        },
        law: {
          heading: "Ley aplicable",
          paragraphs: [
            "Estos términos se rigen por las leyes de la República de Panamá. Las disputas quedan sujetas a los tribunales de la Ciudad de Panamá, salvo que normas imperativas de consumo dispongan otra cosa.",
          ],
        },
        changes: {
          heading: "Cambios en estos términos",
          paragraphs: [
            "Los términos actualizados se publican en esta página con una nueva fecha. Seguir usando Parbin después de un cambio significa que lo aceptas.",
          ],
        },
      },
    },
  },
}
