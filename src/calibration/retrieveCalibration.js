import {
  rubricVersion,
  taskRubric,
  creativeQualityRubric,
  cpsRubric,
  calibrationPrinciples
} from './rubrics.js';

import {
  anchorVersion,
  anchorUseInstructions,
  urbanSourceAnchors
} from './anchors.js';

function formatAnchors() {
  return urbanSourceAnchors
    .map((anchor) => {
      return [
        `Level ${anchor.level}`,
        `Quality: ${anchor.quality}`,
        `Elaboration: ${anchor.elaboration}`,
        `Originality: ${anchor.originality}`,
        `Source example: ${anchor.sourceExample}`
      ].join('\n');
    })
    .join('\n\n');
}

const STATIC_CALIBRATION_CONTEXT = `
CALIBRATION VERSION
${rubricVersion}
${anchorVersion}

${taskRubric}

${creativeQualityRubric}

${cpsRubric}

SOURCE ANCHORS

${formatAnchors()}

${anchorUseInstructions}

${calibrationPrinciples}
`.trim();

/*
 * The calibration context is static and identical for every participant.
 * It does not inspect the current response, retrieve previous responses,
 * classify participants, store diagnostics, or apply topic-based score caps.
 */
export function buildCalibrationContext() {
  return STATIC_CALIBRATION_CONTEXT;
}

/*
 * Compatibility export for older imports.
 * No participant response is accepted or analysed.
 */
export function retrieveCalibration() {
  return {
    version: `${rubricVersion}; ${anchorVersion}`,
    text: STATIC_CALIBRATION_CONTEXT
  };
}

/*
 * Compatibility export for older code.
 * Scores are returned unchanged because automatic caps based on keywords
 * would introduce task-content and experimental-condition bias.
 */
export function applyCalibrationCaps(evaluation) {
  return evaluation;
}
