export const rubricVersion =
  'v11-urban-fixed-conservative-calibration-2026-09-08';

export const urbanProductImprovementRubric = `
URBAN ET AL. (2024) APPENDIX 1:
EVALUATION MATRIX FOR A PRODUCT IMPROVEMENT TASK

This source matrix must be preserved and supplied identically for every response.

QUALITY: usefulness for goals

1 point:
Non-specific ideas.

2 points:
Minor improvements.

3 points:
Major improvements.

4 points:
Some alignment with both goals in the original study:
improve the product and increase sales.

5 points:
Strong alignment with both goals in the original study.

ELABORATION: amount of detail and coherence

1 point:
No detail.

2 points:
Some detail.

3 points:
Moderate detail.

4 points:
Substantial detail.

5 points:
All three solutions in the original task are connected in a single coherent
narrative.

ORIGINALITY: uniqueness of ideas

1 point:
Most common ideas.

2 points:
Ideas that are slightly different.

3 points:
Unusual ideas reflecting a general trend.

4 points:
Rare ideas.

5 points:
Unique and surprising ideas, such as ideas offering novel insights or drawing
meaningfully on knowledge from different domains.

SOURCE-USE BOUNDARIES

Urban et al.'s original task included the goals of improving the rabbit and
increasing sales. If the present task does not contain a sales goal, do not
invent or evaluate sales performance.

The source's level-5 elaboration description refers to its original response
format. It does not mean that every response must contain three solutions,
multiple functions, an application, or an interaction loop.

The examples illustrate score levels. They are not mandatory product forms.
`;

export const studyScaleMapping = `
CONSERVATIVE MAPPING TO THIS STUDY'S 1-7 DIMENSION SCALES

Urban level 1:
Normally study score 1-2.

Urban level 2:
Normally study score 3.

Urban level 3:
Normally study score 4.

Urban level 4:
Normally study score 5-6.
Use 6 only when evidence is clearly stronger than the threshold for 5.

Urban level 5:
Normally study score 7.
Reserve this score for exceptional evidence.

ORIGINALITY 1-7

1 = no identifiable creative idea.
2 = highly common and minimally changed.
3 = familiar minor extension.
4 = unusual mainly because it follows a general product trend.
5 = clearly distinctive or relatively uncommon.
6 = rare and surprising with a clearly explained point of difference.
7 = exceptional, highly surprising and convincingly developed.

A product name, technical term, multiple functions, long response, or
unverified claim cannot by itself justify originality above 4.

USEFULNESS 1-7

1 = no identifiable use value.
2 = weak connection with the task.
3 = limited or broadly stated value.
4 = plausible basic value.
5 = clear potential value for the stated goal or situation.
6 = strong potential value supported by the design as described.
7 = exceptional task alignment with convincing consideration of relevant
operating conditions.

Usefulness means potential usefulness, not demonstrated effectiveness.

ELABORATION/SPECIFICITY 1-7

1 = no developed content.
2 = isolated or vague statements.
3 = a basic direction with little development.
4 = an understandable core idea with some relevant detail.
5 = a clearly developed idea with several type-relevant details.
6 = substantial development in which the central property, relationship, or
mechanism can be understood.
7 = exceptionally complete, precise, coherent, and type-appropriate development.

If the central effect depends on an unexplained property, transformation,
structural relationship, or operating mechanism, elaboration should normally
not exceed 5.
`;

export const overallCreativityRubric = `
OVERALL CREATIVITY 1-6

1 = little identifiable creative contribution.
2 = limited creative development.
3 = basic or moderate creative performance.
4 = reasonably strong performance with a meaningful strength and visible limits.
5 = strong creativity supported by at least two dimensions, without an unresolved
gap that directly affects the central idea.
6 = exceptional creativity, normally requiring originality, usefulness, and
elaboration all to be very strong.

A high usefulness score alone cannot justify overall 5 or 6.
Clear writing or a long response alone cannot justify overall 5 or 6.
`;

export const cpsRubric = `
FIXED CPS STAGE RUBRIC: 1-4

CLARIFY

1 = the improvement goal or problem is largely absent.
2 = a broad goal, problem, or opportunity is mentioned.
3 = relevant goals and problems are reasonably clear.
4 = the intended result, relevant information, and central challenge are clearly
represented and related.

A named user or formal constraint is not mandatory unless required by the task
or central to the participant's concept.

IDEATE

1 = no visible idea generation.
2 = few, highly similar, or unspecified ideas.
3 = several relevant ideas with some genuine conceptual breadth.
4 = several meaningfully different conceptual routes or distinctive alternatives.

A creative category is a substantially different route capable of producing a
meaningfully different proposal. Materials, accessories, properties, or
subfunctions serving one concept do not automatically count as separate
categories.

Five or more numbered items do not automatically justify 4.

DEVELOP

1 = no selected or developed direction.
2 = a loose idea or feature list with minimal development.
3 = a recognizable solution with a reasonably clear central direction.
4 = a well-developed solution whose type-relevant central property, relationship,
or mechanism can be understood.

Material names, function names, use scenarios, and response length do not by
themselves justify 4.

IMPLEMENT

1 = no identifiable final proposal.
2 = a broad final concept with little specification.
3 = a clear final proposal containing several relevant details.
4 = a sufficiently concrete final proposal with type-relevant implementation
awareness and no major unexplained gap in its central operation.

Professional testing or production documentation is not required. Unsupported
claims such as safe, waterproof, effective, compressible, or easy to manufacture
do not by themselves justify 4.
`;

export const typeRelevantCriteria = `
TYPE-RELEVANT DEVELOPMENT CRITERIA

Material improvement:
Check whether the stated material property corresponds to the intended effect.

Structural improvement:
Check whether the main components and their structural relationship are clear.

Appearance improvement:
Check the degree of visual difference and the purpose of that change.

Safety or durability improvement:
Check whether an identified weakness corresponds to the proposed protection.

Portability or storage improvement:
Check whether the transformation, carrying, or storage principle can be
understood and whether relevant physical trade-offs are acknowledged.

Ordinary single-function improvement:
Check its purpose, point of difference, and degree of development.

Interactive design:
Check trigger, user action, product response, and user control only when
interaction is central.

Smart or electronic design:
Check input, judgment, output, control, power, privacy, or maintenance only when
relevant.

Interdependent multi-function system:
Check coordination only when the response explicitly presents functions that
depend on one another.

Do not apply interaction-flow criteria to non-sequential proposals.
`;

export const scoringGuardrails = `
FIXED SCORING GUARDRAILS

1. Score only what is presented.
2. Naming a feature is not the same as explaining it.
3. A common idea may be highly useful but only moderately original.
4. An unusual idea may be original but insufficiently useful or developed.
5. Detailed wording is not automatically substantive elaboration.
6. Related subfeatures are not automatically different creative categories.
7. Ideate 4 requires genuinely different conceptual alternatives.
8. Originality 5 requires a clear point of difference.
9. Originality 6-7 requires strong evidence of rarity or surprise.
10. Develop 4 requires a type-relevant central relationship or mechanism to be
understandable.
11. Implement 4 requires relevant information supporting the central operation.
12. Elaboration 6-7 requires substantial explanation of the central operation.
13. Overall 5 requires strong evidence across at least two dimensions.
14. Overall 6 is reserved for exceptional responses.
15. Safety, effectiveness, compliance, testing, and market claims remain
unverified unless evidence is supplied.
16. A complete interaction experience is not a universal high-score requirement.
17. Select the lower score when evidence lies between two levels.
`;
