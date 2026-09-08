export const rubricVersion =
  'v10-urban-static-evidence-calibration-2026-09-08';

export const taskRubric = `
STATIC SCORING REFERENCE

Urban et al. (2024), Appendix 1:
Evaluation Matrix for a Product Improvement Task.

The original matrix evaluates three dimensions:

1. Quality:
The usefulness of the proposed ideas for the task goals.

2. Elaboration:
The amount of relevant detail and the extent to which the proposed
solution is developed coherently.

3. Originality:
The uniqueness, rarity, and surprising quality of the ideas.

Original 1-5 semantic levels:

Level 1
- Quality: non-specific ideas.
- Elaboration: no detail.
- Originality: most common ideas.

Level 2
- Quality: minor improvements.
- Elaboration: some detail.
- Originality: ideas that are slightly different.

Level 3
- Quality: major improvements.
- Elaboration: moderate detail.
- Originality: unusual ideas reflecting a general trend.

Level 4
- Quality: clear alignment with the task goals.
- Elaboration: substantial relevant detail.
- Originality: rare ideas.

Level 5
- Quality: strong alignment with the task goals.
- Elaboration: highly developed and coherent presentation.
- Originality: unique and surprising ideas, such as ideas offering
  novel insight or drawing meaningfully on different domains.

ADAPTATION TO THIS STUDY

Urban Quality corresponds to usefulness_score.
Urban Elaboration corresponds to elaboration_score / 具体性.
Urban Originality corresponds to originality_score.

The source matrix is a semantic calibration reference. It does not
replace this study's score ranges.

This study uses:
- overall_score: 1-6;
- originality_score: 1-7;
- usefulness_score: 1-7;
- elaboration_score: 1-7;
- CPS stage_score: 1-4.

Do not import the source task's sales goal into the present task.
Judge usefulness against the goals actually stated in the present task
and participant response.
`;

export const creativeQualityRubric = `
ORIGINALITY: 1-7

1 = No identifiable creative idea or almost entirely generic content.
2 = A highly common idea with minimal change.
3 = A familiar minor extension.
4 = A relevant but broadly familiar or trend-based improvement.
5 = A clearly distinctive or uncommon idea or mechanism.
6 = A rare and surprising idea whose difference is clearly supported.
7 = An exceptional and highly surprising idea supported by strong
    response evidence.

Technology, function quantity, writing length, product naming, or
cross-domain vocabulary do not automatically indicate originality.

When population-frequency evidence is unavailable, do not claim that an
idea is unique or extremely rare. Scores of 6 or 7 require affirmative
evidence rather than merely the absence of an obvious weakness.

USEFULNESS: 1-7

1 = No identifiable use value.
2 = Weak relation to the task.
3 = Limited or broadly stated value.
4 = Plausible basic value.
5 = Clear potential value for the stated goal or situation.
6 = Strong potential value supported by relevant conditions.
7 = Exceptional task alignment with convincing consideration of the
    conditions central to the proposal.

Usefulness refers to potential value inferred from the response.
It does not mean verified effectiveness.

ELABORATION / SPECIFICITY: 1-7

1 = No developed content.
2 = Isolated or vague statements.
3 = A basic direction with little development.
4 = An understandable core idea with some relevant detail.
5 = A clearly developed idea with several type-relevant details.
6 = Substantial and internally clear development.
7 = Exceptionally complete, precise, and type-appropriate development.

Elaboration is judged according to what the selected type of idea needs.
It is not determined by word count, technical vocabulary, number of
features, or the presence of a sequential interaction process.

OVERALL CREATIVITY: 1-6

1 = Little identifiable creative contribution.
2 = Limited creative development.
3 = Basic or moderate creative performance.
4 = Reasonably strong overall performance.
5 = Strong creativity supported across relevant dimensions.
6 = Exceptional overall creativity.

Overall creativity is holistic and need not equal the arithmetic mean.
High usefulness alone does not justify an overall score of 5 or 6.
`;

export const cpsRubric = `
CPS STAGE RUBRIC: 1-4

Clarify

1 = The improvement problem is largely absent.
2 = A broad goal, situation, problem, or opportunity is mentioned.
3 = Relevant goals and problems are reasonably clear.
4 = Goals, relevant information, and the central challenge are clearly
    represented and meaningfully related.

A named user is not mandatory unless required by the task or central to
the participant's own proposal.

Ideate

1 = No visible idea generation.
2 = Few, highly similar, or unspecified ideas.
3 = Several relevant ideas with some genuine conceptual breadth.
4 = Several meaningfully different conceptual routes or distinctive
    alternatives.

A numbered item is not automatically an independent idea category.
Materials, accessories, properties, components, and subfunctions serving
one product concept may belong to the same conceptual route.

Develop

1 = No developed direction.
2 = A loose or minimally developed direction.
3 = A recognizable and reasonably developed solution.
4 = A well-developed solution whose type-relevant relationships,
    principle, or intended operation can be understood.

Develop 4 does not require every proposal to have an interaction loop,
multiple functions, or an integrated user experience.

Implement

1 = No identifiable final proposal.
2 = A broad final concept with little specification.
3 = A clear final proposal with several relevant details.
4 = A sufficiently concrete proposal showing implementation awareness
    relevant to its own type.

Completing the response form does not automatically justify 4/4.
When the relation central to the proposed effect remains only named or
asserted, upper-level Develop and Implement scores are not justified.
`;

export const calibrationPrinciples = `
CALIBRATION PRINCIPLES

1. Use exactly the same rubric for every participant.
2. Do not retrieve similar participant responses.
3. Do not match scores from keywords, product topics, or scenario labels.
4. Do not impose automatic score caps based on the product category.
5. Judge each dimension independently from affirmative response evidence.
6. Treat Urban's examples as illustrations of levels, not target designs.
7. An app, sensor system, or multi-function ecosystem is not inherently
   superior to a well-developed material, structural, appearance, safety,
   portability, or single-function idea.
8. A coherent presentation does not mean every proposal must contain a
   complete user-experience loop.
9. Multiple features are not automatically feature stacking.
10. Several components supporting one concept are not automatically
    separate candidate solutions.
11. Do not reward strong claims unless the response explains their basis.
12. Do not require professional market research, engineering drawings,
    testing data, formal cost estimates, or production documentation from
    university students completing a short laboratory task.
13. Do not deliberately seek high, middle, or low scores. Apply the same
    evidence threshold across all responses.
`;
