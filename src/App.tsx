import { Routes, Route } from "react-router-dom"
import { lazy, Suspense } from "react"

const HomePage = lazy(() => import("@/pages/home"))
const Design1 = lazy(() => import("@/designs/design-1"))
const Design2 = lazy(() => import("@/designs/design-2"))
const Design3 = lazy(() => import("@/designs/design-3"))
const Design4 = lazy(() => import("@/designs/design-4"))
const Design5 = lazy(() => import("@/designs/design-5"))

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/1/*" element={<Design1 />} />
        <Route path="/2/*" element={<Design2 />} />
        <Route path="/3/*" element={<Design3 />} />
        <Route path="/4/*" element={<Design4 />} />
        <Route path="/5/*" element={<Design5 />} />
      </Routes>
    </Suspense>
  )
}

export default App
