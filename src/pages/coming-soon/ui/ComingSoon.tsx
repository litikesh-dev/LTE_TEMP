import { Link } from 'react-router-dom';
import { Compass, Trophy, TrendingUp, Sparkles, ArrowLeft, Hammer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import './coming-soon.css';

const ICONS: Record<string, LucideIcon> = {
  explore: Compass,
  achievements: Trophy,
  progress: TrendingUp,
};

interface ComingSoonProps {
  title: string;
  description: string;
  iconKey: keyof typeof ICONS;
}

export function ComingSoon({ title, description, iconKey }: ComingSoonProps) {
  const Icon = ICONS[iconKey] ?? Sparkles;

  return (
    <div className="cs-root">
      <div className="cs-card">
        <span className="cs-badge">
          <Hammer size={13} /> Under Construction
        </span>

        <div className="cs-icon-orb">
          <Icon size={40} strokeWidth={1.7} />
          <span className="cs-spark cs-spark--1"><Sparkles size={14} /></span>
          <span className="cs-spark cs-spark--2"><Sparkles size={10} /></span>
        </div>

        <h1 className="cs-title">{title}</h1>
        <p className="cs-coming">Coming Soon</p>
        <p className="cs-desc">{description}</p>

        <p className="cs-progress-note">We&rsquo;re building something great here.</p>

        <Link to="/" className="cs-back-btn">
          <ArrowLeft size={15} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
