import {
  rubricVersion,
  urbanProductImprovementRubric,
  studyScaleMapping,
  overallCreativityRubric,
  cpsRubric,
  typeRelevantCriteria,
  scoringGuardrails
} from './rubrics.js';

import {
  anchorVersion,
  anchorUseInstructions,
  urbanAnchors,
  dimensionAnchors
} from './anchors.js';

function formatUrbanAnchors() {
  return urbanAnchors
    .map((anchor) => `
${anchor.id}
Urban level: ${anchor.urbanLevel}/5
Study-scale band: ${anchor.studyBand}/7
Quality: ${anchor.quality}
Elaboration: ${anchor.elaboration}
Originality: ${anchor.originality}
Source example: ${anchor.sourceExample}
Boundary: ${anchor.boundary}
    `.trim())
    .join('\n\n');
}

function formatDimensionAnchors() {
  return Object.entries(dimensionAnchors)
    .map(([dimension, anchors]) => `
${dimension.toUpperCase()}
${anchors.map((item) => `- ${item}`).join('\n')}
    `.trim())
    .join('\n\n');
}

const FIXED_CALIBRATION_TEXT = `
FIXED EXPERT CALIBRATION

The following calibration is identical for every participant.

It contains:
- no participant history;
- no keyword retrieval;
- no similarity matching;
- no participant-specific score cap;
- no previous evaluation;
- no feedback-language example.

1. Urban et al. source matrix

${urbanProductImprovementRubric}

2. Mapping to this study's scales

${studyScaleMapping}

3. Overall creativity rubric

${overallCreativityRubric}

4. CPS stage rubric

${cpsRubric}

5. Type-relevant criteria

${typeRelevantCriteria}

6. Scoring guardrails

${scoringGuardrails}

7. Urban source anchors

${formatUrbanAnchors()}

8. Dimension anchors

${formatDimensionAnchors()}

9. Anchor-use instructions

${anchorUseInstructions}
`.trim();

export function buildCalibrationContext() {
  return {
    text: FIXED_CALIBRATION_TEXT,
    metadata: {
      fixed: true,
      rubricVersion,
      anchorVersion
    }
  };
}

/*
 * Compatibility exports only.
 * They never inspect participant content or change scores.
 */
export function retrieveCalibration() {
  return {
    fixed: true,
    rubricVersion,
    anchorVersion,
    scoreCaps: {},
    matchedAnchors: []
  };
}

export function applyCalibrationCaps(evaluation) {
  return evaluation;
}
