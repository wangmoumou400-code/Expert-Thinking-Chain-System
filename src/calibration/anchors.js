export const anchorVersion =
  'v10-urban-source-anchors-no-case-matching-2026-09-08';

export const anchorUseInstructions = `
These rows reproduce the semantic progression of Urban et al. (2024),
Appendix 1.

They must be used only to understand the difference between low and high
levels. They must not be matched to the current response through keywords.

Do not:
- assign the listed example's score to a similar-looking response;
- copy its content or wording into participant feedback;
- treat the level-5 app example as the required form of a high-quality idea;
- assume that technology or multiple functions deserve a high score;
- infer that a proposal is weak merely because it is a material, structural,
  appearance, safety, portability, or single-function improvement.

The defining criteria are quality, elaboration, and originality.
The examples are source-task illustrations only.
`;

export const urbanSourceAnchors = Object.freeze([
  Object.freeze({
    level: 1,
    quality: 'Non-specific ideas.',
    elaboration: 'No detail.',
    originality: 'Most common ideas.',
    sourceExample: 'Changing the color or making the eyes larger.'
  }),
  Object.freeze({
    level: 2,
    quality: 'Minor improvements.',
    elaboration: 'Some detail.',
    originality: 'Ideas that are slightly different.',
    sourceExample:
      'Allowing the rabbit to be dressed in more personalized clothes.'
  }),
  Object.freeze({
    level: 3,
    quality: 'Major improvements.',
    elaboration: 'Moderate detail.',
    originality: 'Unusual ideas reflecting a general trend.',
    sourceExample:
      'Adding built-in LED lights or light strips activated by buttons.'
  }),
  Object.freeze({
    level: 4,
    quality: 'Clear alignment with the source task goals.',
    elaboration: 'Substantial relevant detail.',
    originality: 'Rare ideas.',
    sourceExample:
      'Adding reading and speaking functions connected with educational books.'
  }),
  Object.freeze({
    level: 5,
    quality: 'Strong alignment with the source task goals.',
    elaboration:
      'Highly developed solutions presented in a coherent account.',
    originality:
      'Unique and surprising ideas offering novel insight or meaningful cross-domain use.',
    sourceExample:
      'An app, microphone, speaker, sensors, games, and learning activities presented as one developed concept.'
  })
]);
