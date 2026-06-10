import { Suspense } from 'react'
import { HelpView } from '@/modules/help/HelpView'

export default function HelpPage() {
  return (
    <Suspense fallback={null}>
      <HelpView />
    </Suspense>
  )
}
