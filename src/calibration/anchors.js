export const anchorVersion =
  'v11-urban-source-anchors-no-language-imitation-2026-09-08';

export const anchorUseInstructions = `
These anchors are identical for every participant.

They represent the five levels shown in Urban et al. (2024), Appendix 1.
Use them only to calibrate score severity.

Do not copy their wording into feedback.
Do not treat them as required product types.
Do not use one anchor as a fixed score for the entire response.
Judge quality, elaboration, and originality separately.
Do not assume every high-scoring proposal must resemble the level-5 example.
`;

export const urbanAnchors = [
  {
    id: 'URBAN_LEVEL_1',
    urbanLevel: 1,
    studyBand: '1-2',
    quality: 'Non-specific ideas.',
    elaboration: 'No detail.',
    originality: 'Most common ideas.',
    sourceExample: 'Changing colour or making the eyes larger.',
    boundary:
      'An appearance idea is not automatically level 1 when it has a distinctive and sufficiently developed purpose.'
  },
  {
    id: 'URBAN_LEVEL_2',
    urbanLevel: 2,
    studyBand: '3',
    quality: 'Minor improvements.',
    elaboration: 'Some detail.',
    originality: 'Ideas that are slightly different.',
    sourceExample:
      'Allowing the rabbit to wear more personalised clothing.',
    boundary:
      'Personalisation may perform differently when it has a developed function rather than serving only as decoration.'
  },
  {
    id: 'URBAN_LEVEL_3',
    urbanLevel: 3,
    studyBand: '4',
    quality: 'Major improvements.',
    elaboration: 'Moderate detail.',
    originality: 'Unusual ideas reflecting a general trend.',
    sourceExample:
      'Adding built-in LED lights or light strips controlled by buttons.',
    boundary:
      'Technology does not automatically increase originality beyond this level.'
  },
  {
    id: 'URBAN_LEVEL_4',
    urbanLevel: 4,
    studyBand: '5-6',
    quality:
      'Some alignment with both goals in the original task.',
    elaboration: 'Substantial detail.',
    originality: 'Rare ideas.',
    sourceExample:
      'Combining the rabbit with a reader, speaker, and accompanying books.',
    boundary:
      'Choose 5 unless the evidence clearly supports the stronger end of this band.'
  },
  {
    id: 'URBAN_LEVEL_5',
    urbanLevel: 5,
    studyBand: '7',
    quality:
      'Strong alignment with both goals in the original task.',
    elaboration:
      'Exceptionally developed and coherently presented for the source task.',
    originality:
      'Unique and surprising ideas offering novel insight or meaningful cross-domain use.',
    sourceExample:
      'An application combined with microphone, speaker, sensors, and participant-created activities.',
    boundary:
      'This is one exceptional example, not a requirement for applications, multiple functions, ecosystems, or interaction loops.'
  }
];

export const dimensionAnchors = {
  originality: [
    '1-2: absent, generic, or among the most common responses.',
    '3: familiar minor extension.',
    '4: unusual mainly as part of a general trend.',
    '5: clearly distinctive or relatively uncommon.',
    '6: rare and surprising with a clear point of difference.',
    '7: exceptional and highly surprising.'
  ],
  usefulness: [
    '1-2: little identifiable task value.',
    '3: limited or broadly stated value.',
    '4: plausible basic value.',
    '5: clear potential value.',
    '6: strong potential value supported by the described design.',
    '7: exceptional task alignment and operating awareness.'
  ],
  elaboration: [
    '1-2: absent or very limited development.',
    '3: basic development.',
    '4: understandable core idea with moderate detail.',
    '5: clear development with several relevant details.',
    '6: substantial explanation of the central property or mechanism.',
    '7: exceptionally complete and precise development.'
  ]
};
