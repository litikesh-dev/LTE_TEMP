import { Lock, CheckCircle2, Circle, ChevronRight, Trophy, Star } from 'lucide-react';
import './LevelProgress.css';

interface LevelProgressProps {
  currentLevel: number;
  totalLevels: number;
  coursesCompleted: number;
  coursesRequired: number;
  nextLevelCourses?: number;
  roleName: string;
}

export function LevelProgress({
  currentLevel,
  totalLevels,
  coursesCompleted,
  coursesRequired,
  nextLevelCourses = 2,
  roleName,
}: LevelProgressProps) {
  const progressPercentage = (coursesCompleted / coursesRequired) * 100;
  const isLevelComplete = coursesCompleted >= coursesRequired;
  const coursesRemaining = coursesRequired - coursesCompleted;

  return (
    <div className="lp-card">
      <div className="lp-header">
        <div className="lp-header-left">
          <Trophy size={18} className="lp-header-icon" />
          <div>
            <h3 className="lp-title">Learning Path Progress</h3>
            <p className="lp-subtitle">{roleName}</p>
          </div>
        </div>
        <div className="lp-level-badge">
          <Star size={14} />
          Level {currentLevel}
        </div>
      </div>

      {/* Level Timeline */}
      <div className="lp-timeline">
        {Array.from({ length: totalLevels }, (_, i) => i + 1).map(level => {
          const isActive = level === currentLevel;
          const isCompleted = level < currentLevel;
          const isLocked = level > currentLevel;

          return (
            <div key={level} className="lp-timeline-item">
              <div
                className={`lp-level-node ${
                  isCompleted
                    ? 'lp-level-node--completed'
                    : isActive
                      ? 'lp-level-node--active'
                      : 'lp-level-node--locked'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : isLocked ? (
                  <Lock size={14} />
                ) : (
                  <Circle size={14} />
                )}
              </div>
              <span className="lp-level-label">L{level}</span>
              {level < totalLevels && (
                <div
                  className={`lp-level-connector ${isCompleted ? 'lp-level-connector--filled' : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current Level Progress */}
      <div className="lp-progress-section">
        <div className="lp-progress-header">
          <span className="lp-progress-label">Level {currentLevel} Progress</span>
          <span className="lp-progress-count">
            {coursesCompleted} / {coursesRequired} courses
          </span>
        </div>
        <div className="lp-progress-bar">
          <div className="lp-progress-fill" style={{ width: `${progressPercentage}%` }} />
        </div>
      </div>

      {/* Status Message */}
      {isLevelComplete ? (
        <div className="lp-status lp-status--complete">
          <CheckCircle2 size={16} />
          <div className="lp-status-content">
            <p className="lp-status-title">Level {currentLevel} Complete! 🎉</p>
            <p className="lp-status-text">
              {nextLevelCourses} new courses unlocked in Level {currentLevel + 1}
            </p>
          </div>
          <button className="lp-status-btn">
            Advance to Level {currentLevel + 1}
            <ChevronRight size={16} />
          </button>
        </div>
      ) : (
        <div className="lp-status lp-status--progress">
          <div className="lp-status-icon">
            <Circle size={16} />
          </div>
          <div className="lp-status-content">
            <p className="lp-status-title">
              {coursesRemaining} {coursesRemaining === 1 ? 'course' : 'courses'} remaining
            </p>
            <p className="lp-status-text">
              Complete all Level {currentLevel} courses to unlock Level {currentLevel + 1}
            </p>
          </div>
        </div>
      )}

      {/* Next Level Preview */}
      {currentLevel < totalLevels && (
        <div className="lp-next-level">
          <div className="lp-next-level-header">
            <Lock size={14} className="lp-next-level-icon" />
            <span className="lp-next-level-title">Level {currentLevel + 1} Preview</span>
          </div>
          <p className="lp-next-level-text">
            {nextLevelCourses} additional courses will be unlocked when you complete Level{' '}
            {currentLevel}
          </p>
        </div>
      )}
    </div>
  );
}
