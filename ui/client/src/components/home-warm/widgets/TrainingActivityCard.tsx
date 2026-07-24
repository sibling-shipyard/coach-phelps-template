import { useEffect, useState } from "react";
import type { ActivityCellState, TrainingActivitySnapshot } from "../snapshots";

const ACTIVITY_LEGEND: Array<{ state: ActivityCellState; label: string }> = [
  { state: "badminton", label: "BDM" },
  { state: "calisthenics", label: "CAL" },
  { state: "foundation", label: "FDN" },
  { state: "cycling", label: "RIDE" },
  { state: "run", label: "RUN" },
  { state: "strength", label: "STR" },
  { state: "weight_training", label: "WGT" },
  { state: "hike", label: "HIK" },
  { state: "walk", label: "WLK" },
  { state: "cricket", label: "CRK" },
  { state: "football", label: "FBL" },
  { state: "workout", label: "WKT" },
  { state: "swim", label: "SWM" },
  { state: "planned-missed", label: "PLANNED · MISSED" },
];

export function TrainingActivityCard({ activity }: { activity: TrainingActivitySnapshot }) {
  const visibleCount = Math.min(4, activity.months.length);
  const latestStart = Math.max(0, activity.months.length - visibleCount);
  const [windowStart, setWindowStart] = useState(latestStart);

  useEffect(() => {
    setWindowStart(Math.max(0, activity.months.length - Math.min(4, activity.months.length)));
  }, [activity.months]);

  const visibleMonths = activity.months.slice(windowStart, windowStart + visibleCount);
  const rangeLabel = `${visibleMonths[0]?.label ?? ""}–${visibleMonths.at(-1)?.label ?? ""}`;

  return (
    <section className="wi-training-card">
      <div className="wi-training-card__header">
        <span className="wi-card-label">TRAINING ACTIVITY · {rangeLabel}</span>
        <div className="wi-training-card__header-tools">
          <div className="wi-training-card__legend">
            {ACTIVITY_LEGEND.map((item) => (
              <span key={item.state}><i className={`is-${item.state}`} />{item.label}</span>
            ))}
          </div>
          <div className="wi-training-card__paging" aria-label="Training activity month window">
            <button
              aria-label="Show previous four months"
              disabled={windowStart === 0}
              onClick={() => setWindowStart((current) => Math.max(0, current - visibleCount))}
              type="button"
            >←</button>
            <button
              aria-label="Show next four months"
              disabled={windowStart >= latestStart}
              onClick={() => setWindowStart((current) => Math.min(latestStart, current + visibleCount))}
              type="button"
            >→</button>
          </div>
        </div>
      </div>
      <div className="wi-training-card__body">
        <div className="wi-training-card__months" data-wi-month-window={rangeLabel}>
          {visibleMonths.map((month) => (
            <div className="wi-activity-month" key={month.label}>
              <strong>{month.label}</strong>
              <div className="wi-activity-month__days">
                {Array.from("MTWTFSS").map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}
              </div>
              <div className="wi-activity-month__grid">
                {month.cells.slice(0, 28).map((cell, index) => (
                  <i className={`is-${cell}`} key={`${month.label}-${index}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="wi-training-card__stats">
          <div><strong>{activity.longestBlock}D</strong><span>LONGEST BLOCK</span></div>
          <div><strong>{activity.planTruePercent === null ? "—" : `${activity.planTruePercent}%`}</strong><span>PLAN-TRUE</span></div>
          <div><strong>{activity.gapCount}</strong><span>GAPS · WORST {activity.worstGap}D</span></div>
        </div>
      </div>
      <p>{activity.read}</p>
    </section>
  );
}
