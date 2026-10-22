export interface SRSItem {
  repetition: number;
  interval: number;
  easeFactor: number;
  dueDate: Date;
}

/**
 * SuperMemo-2 (SM-2) Spaced Repetition Algorithm
 * Grade: 
 * 5: Perfect response
 * 4: Correct response after a hesitation
 * 3: Correct response recalled with serious difficulty
 * 2: Incorrect response; where the correct one seemed easy to recall
 * 1: Incorrect response; the correct one remembered
 * 0: Complete blackout
 */
export function calculateSM2(item: SRSItem, grade: number, now = new Date()): SRSItem {
  if (!Number.isInteger(grade) || grade < 0 || grade > 5) throw new Error('Invalid SM-2 grade');
  let { repetition, interval, easeFactor } = item;

  if (grade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetition++;
  } else {
    repetition = 0;
    interval = 1;
  }

  // Update ease factor: EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02))
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = new Date(now);
  dueDate.setUTCDate(dueDate.getUTCDate() + interval);

  return {
    repetition,
    interval,
    easeFactor,
    dueDate
  };
}
