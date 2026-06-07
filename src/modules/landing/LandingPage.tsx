import { LandingNavbar } from './layout/LandingNavbar'
import { LandingFooter } from './layout/LandingFooter'
import { HeroSection } from './sections/HeroSection'
import { ProblemSection } from './sections/ProblemSection'
import { CoreLoopSection } from './sections/CoreLoopSection'
import { ScienceSection } from './sections/ScienceSection'
import { TeacherModeSection } from './sections/TeacherModeSection'
import { DashboardMockupSection } from './sections/DashboardMockupSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { SocialProofSection } from './sections/SocialProofSection'
import { WaitlistSection } from './sections/WaitlistSection'

export function LandingPage() {
  return (
    <div className="landing-dark" style={{
      minHeight: '100vh',
      fontFamily: 'var(--font-geist-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)',
    }}>
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <CoreLoopSection />
        <ScienceSection />
        <TeacherModeSection />
        <DashboardMockupSection />
        <FeaturesSection />
        <SocialProofSection />
        <WaitlistSection />
      </main>
      <LandingFooter />
    </div>
  )
}
