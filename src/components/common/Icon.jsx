import {
  ArrowDown,
  ArrowUp,
  Backpack,
  BookOpen,
  Bot,
  Brain,
  Briefcase,
  Building2,
  Camera,
  ChartBar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Code2,
  Download,
  FileText,
  Flame,
  FlaskConical,
  Gamepad2,
  Globe,
  GraduationCap,
  Handshake,
  Heart,
  HeartPulse,
  Home,
  Laptop,
  Lightbulb,
  Lock,
  LogOut,
  Map,
  Megaphone,
  MessageCircle,
  Palette,
  PartyPopper,
  Puzzle,
  Rocket,
  Scale,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
  Users,
  Trash2,
  Wallet,
  Wrench,
} from 'lucide-react'

const ICONS = {
  target: Target,
  puzzle: Puzzle,
  map: Map,
  'file-text': FileText,
  scale: Scale,
  sparkles: Sparkles,
  briefcase: Briefcase,
  robot: Bot,
  'graduation-cap': GraduationCap,
  backpack: Backpack,
  'building-2': Building2,
  camera: Camera,
  home: Home,
  laptop: Laptop,
  'code-2': Code2,
  cloud: Cloud,
  'shield-check': ShieldCheck,
  gear: Settings2,
  handshake: Handshake,
  settings: Settings2,
  'log-out': LogOut,
  flame: Flame,
  trophy: Trophy,
  party: PartyPopper,
  download: Download,
  chart: ChartBar,
  wallet: Wallet,
  flask: FlaskConical,
  gamepad: Gamepad2,
  'book-open': BookOpen,
  'heart-pulse': HeartPulse,
  heart: Heart,
  'arrow-up': ArrowUp,
  'arrow-down': ArrowDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  globe: Globe,
  lock: Lock,
  sprout: Sprout,
  star: Star,
  brain: Brain,
  palette: Palette,
  message: MessageCircle,
  megaphone: Megaphone,
  users: Users,
  rocket: Rocket,
  lightbulb: Lightbulb,
  wrench: Wrench,
  trash: Trash2,
}

export function GithubIcon({ size = 24, className = '' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

export default function Icon({ name, size = 24, className = '', strokeWidth = 2, fill = false }) {
  if (name === 'github') return <GithubIcon size={size} className={className} />
  const Component = ICONS[name]
  if (!Component) return null
  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      fill={fill ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
  )
}