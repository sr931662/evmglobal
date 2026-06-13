import { usePageMeta } from '../../hooks/usePageMeta'
import TravelQuizModal from '../../components/home/TravelQuizModal/TravelQuizModal'

const OG_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200&h=630'

export default function PlanTrip() {
  usePageMeta(
    'Plan My Dream Trip | Ease My Vacations Global',
    'Take our 2-minute travel quiz and get a personalised holiday itinerary. Tell us your dream destination, travel season, companions and budget — our concierge will do the rest.',
    { image: OG_IMAGE, url: 'https://www.easemyvacationsglobal.com/plan-trip' }
  )

  return <TravelQuizModal standalone />
}
