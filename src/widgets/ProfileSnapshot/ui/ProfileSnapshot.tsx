import { Sparkles, TrendingUp, Heart, Briefcase, Target, Award, Zap } from 'lucide-react';
import type { ProfileSnapshot as ProfileSnapshotType } from '@/shared/types';
import './ProfileSnapshot.css';

interface ProfileSnapshotProps {
  snapshot: ProfileSnapshotType;
  compact?: boolean;
}

export function ProfileSnapshot({ snapshot, compact = false }: ProfileSnapshotProps) {
  const { key_patterns, aptitude_strengths } = snapshot;

  if (compact) {
    return (
      <div className="ps-compact">
        <div className="ps-compact-header">
          <div className="ps-compact-icon-wrap">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="ps-compact-title">Your Strengths</h3>
            <p className="ps-compact-subtitle">Top aptitudes</p>
          </div>
        </div>
        <div className="ps-aptitudes-mini">
          {aptitude_strengths.slice(0, 3).map((apt, i) => (
            <div key={i} className="ps-apt-mini">
              <div className="ps-apt-mini-left">
                <div className="ps-apt-mini-medal">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <span className="ps-apt-mini-name">{apt.name}</span>
              </div>
              <span className="ps-apt-mini-pct">Top {100 - parseInt(apt.percentile)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ps-card">
      <div className="ps-header">
        <div className="ps-header-icon-wrap">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="ps-title">Your Learning DNA</h3>
          <p className="ps-subtitle">What makes you unique as a learner</p>
        </div>
      </div>

      {/* Top Strengths - Most Important First */}
      <div className="ps-section">
        <div className="ps-section-header">
          <Award size={16} className="ps-section-icon" />
          <h4 className="ps-section-title">Your Top Strengths</h4>
        </div>
        <div className="ps-strengths-grid">
          {aptitude_strengths.map((apt, i) => {
            const percentile = parseInt(apt.percentile);
            const topPercent = 100 - percentile;
            return (
              <div key={i} className="ps-strength-card">
                <div className="ps-strength-header">
                  <div className="ps-strength-medal">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="ps-strength-info">
                    <span className="ps-strength-name">{apt.name}</span>
                    <span className="ps-strength-rank">
                      Better than {percentile}% of learners
                    </span>
                  </div>
                </div>
                <div className="ps-strength-bar-wrap">
                  <div className="ps-strength-bar">
                    <div
                      className="ps-strength-bar-fill"
                      style={{ width: `${percentile}%` }}
                    />
                  </div>
                  <span className="ps-strength-label">Top {topPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Learning Style - Simplified */}
      <div className="ps-section">
        <div className="ps-section-header">
          <Zap size={16} className="ps-section-icon" />
          <h4 className="ps-section-title">How You Learn Best</h4>
        </div>
        <div className="ps-style-grid">
          <div className="ps-style-card">
            <div className="ps-style-icon ps-style-icon--strength">
              <Target size={18} />
            </div>
            <div className="ps-style-content">
              <span className="ps-style-label">Your Superpower</span>
              <p className="ps-style-text">{key_patterns.strength}</p>
            </div>
          </div>

          <div className="ps-style-card">
            <div className="ps-style-icon ps-style-icon--motivation">
              <TrendingUp size={18} />
            </div>
            <div className="ps-style-content">
              <span className="ps-style-label">What Drives You</span>
              <p className="ps-style-text">{key_patterns.motivation}</p>
            </div>
          </div>

          <div className="ps-style-card">
            <div className="ps-style-icon ps-style-icon--enjoyment">
              <Heart size={18} />
            </div>
            <div className="ps-style-content">
              <span className="ps-style-label">What You Love</span>
              <p className="ps-style-text">{key_patterns.enjoyment}</p>
            </div>
          </div>

          <div className="ps-style-card">
            <div className="ps-style-icon ps-style-icon--workstyle">
              <Briefcase size={18} />
            </div>
            <div className="ps-style-content">
              <span className="ps-style-label">Your Approach</span>
              <p className="ps-style-text">{key_patterns.workStyle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
