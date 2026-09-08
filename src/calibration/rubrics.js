export const rubricVersion =
  'v10-fixed-urban-calibration-type-adaptive-2026-09-08';

export const urbanProductImprovementRubric = `
FIXED URBAN ET AL. (2024) PRODUCT IMPROVEMENT MATRIX

This matrix is supplied identically for every participant.

Quality: usefulness for goals
1 = non-specific ideas.
2 = minor improvements.
3 = major improvements.
4 = some alignment with both original task goals.
5 = strong alignment with both original task goals.

Elaboration: amount of detail and coherence
1 = no detail.
2 = some detail.
3 = moderate detail.
4 = substantial detail.
5 = the proposed solutions are connected in a coherent account.

Originality: uniqueness of ideas
1 = most common ideas.
2 = ideas that are slightly different.
3 = unusual ideas reflecting a general trend.
4 = rare ideas.
5 = unique and surprising ideas, such as ideas offering novel insights or
    drawing meaningfully on knowledge from different domains.

SOURCE-USE BOUNDARIES

Urban et al.'s original task contained the goals of improving the rabbit and
increasing sales. If the current experiment does not include a sales goal, do
not invent or evaluate sales performance.

The source's level-5 elaboration example connected three solutions in one
coherent narrative. This is a source-specific high-level anchor. It does not
mean every proposal must contain three solutions, multiple functions, an app,
or a complete interaction experience.

The source examples represent score levels rather than mandatory product forms.
`;

export const studyScaleMapping = `
MAPPING FROM URBAN'S 1-5 SEMANTIC LEVELS TO THIS STUDY'S 1-7 DIMENSION SCALES

Urban level 1 generally corresponds to study scores 1-2.
Urban level 2 generally corresponds to study score 3.
Urban level 3 generally corresponds to study score 4.
Urban level 4 generally corresponds to study scores 5-6.
Urban level 5 generally corresponds to study score 7.

Choose the lower or upper value within a band from the strength of evidence.
Do not automatically choose the upper value.

ORIGINALITY 1-7

1 = no identifiable creative idea.
2 = highly common and minimally changed.
3 = familiar minor extension.
4 = relevant but broadly familiar or trend-based improvement.
5 = clearly distinctive or uncommon relative to ordinary plush-toy ideas.
6 = rare and surprising, with a clearly explained point of difference.
7 = exceptional, highly surprising and convincingly developed.

A product name, technical term, multiple functions, long description, or
unverified claim cannot by itself justify originality above 4.

USEFULNESS 1-7

1 = no identifiable use value.
2 = weak connection with the task.
3 = limited or broadly stated potential value.
4 = plausible basic value.
5 = clear potential value for the stated goal or situation.
6 = strong potential value supported by the proposed design.
7 = exceptional alignment with the task and convincing consideration of
    relevant operating conditions.

Usefulness means potential usefulness, not demonstrated effectiveness.

ELABORATION/SPECIFICITY 1-7

1 = no developed content.
2 = isolated or vague statements.
3 = a basic direction with little development.
4 = an understandable core idea with some relevant details.
5 = a clearly developed idea with several type-relevant details.
6 = substantial development in which the central property, relationship, or
    mechanism can be understood.
7 = exceptionally complete, precise, coherent and type-appropriate development.

If the central effect depends on a property, transformation, structural
relationship, or operating mechanism that is not explained, elaboration should
normally not exceed 5.
`;

export const overallCreativityRubric = `
OVERALL CREATIVITY 1-6

1 = little identifiable creative contribution.
2 = limited creative development.
3 = basic or moderate creative performance.
4 = reasonably strong performance with a meaningful strength and visible limits.
5 = strong creativity supported by at least two dimensions, without an unresolved
    gap that directly threatens the central idea.
6 = exceptional overall creativity, normally requiring originality, usefulness
    and elaboration all to be very strong.

A high usefulness score alone cannot justify overall 5 or 6.
Clear writing alone cannot justify overall 5 or 6.
`;

export const cpsRubric = `
FIXED CPS STAGE RUBRIC, SCORED 1-4

CLARIFY

1 = the improvement goal or problem is largely absent.
2 = a broad goal, problem or opportunity is mentioned.
3 = relevant goals and problems are reasonably clear.
4 = the intended result, relevant information and central challenge are clearly
    represented and related.

A named user or formal constraint is not mandatory unless the task requires it
or it is central to the participant's concept.

IDEATE

1 = no visible idea generation.
2 = few, highly similar or unspecified ideas.
3 = several relevant ideas with some genuine conceptual breadth.
4 = several meaningfully different conceptual routes or distinctive alternatives.

A creative category is a substantially different route that could produce a
meaningfully different proposal. Materials, accessories or subfunctions serving
one concept do not automatically count as separate categories.

Five or more numbered entries do not automatically justify 4.

DEVELOP

1 = no selected or developed direction.
2 = a loose idea or feature list with minimal development.
3 = a recognizable solution with a reasonably clear central direction.
4 = a well-developed solution whose type-relevant central property, relationship
    or mechanism can be understood.

Material names, feature names, use scenarios and writing length do not by
themselves justify 4.

IMPLEMENT

1 = no identifiable final proposal.
2 = a broad final concept with little specification.
3 = a clear final proposal containing several relevant details.
4 = a sufficiently concrete final proposal with type-relevant implementation
    awareness and no major unexplained gap in its central operation.

Professional testing and production documentation are not required.
Unsupported claims such as safe, waterproof, compressible, effective, or easy
to manufacture do not by themselves justify 4.
`;

export const typeRelevantCriteria = `
TYPE-RELEVANT DEVELOPMENT CRITERIA

Material improvement:
Check whether the stated material property corresponds to the intended effect.

Structural improvement:
Check whether the main components and their structural relationship are clear.

Appearance improvement:
Check the degree of visual difference and the purpose of the visual change.

Safety or durability improvement:
Check whether the identified weakness corresponds to the proposed protection.

Portability or storage improvement:
Check whether the physical transformation, carrying or storage principle can be
understood and whether obvious trade-offs are acknowledged when relevant.

Ordinary single-function improvement:
Check whether the function has a clear purpose, point of difference and adequate
development.

Interactive design:
Check trigger, user action, product response and user control only when the
interaction is central.

Smart or electronic design:
Check input, judgment, output, control, power, privacy or maintenance only when
they are relevant.

Interdependent multi-function system:
Check coordination only when the participant explicitly presents functions that
depend on one another.

Do not apply interaction-flow criteria to material, appearance, structural,
safety, storage or other non-sequential proposals unless the response itself
makes sequential interaction central.
`;

export const scoringGuardrails = `
FIXED SCORING GUARDRAILS

1. Score the evidence presented, not the evaluator's imagined improved version.
2. Presence is not adequacy: naming a material, sensor, structure or function
   does not prove that its operation has been explained.
3. A common idea may receive high usefulness but moderate originality.
4. An unusual idea may receive high originality but limited usefulness.
5. Detailed wording is not automatically substantive elaboration.
6. Multiple related details are not automatically multiple creative categories.
7. Ideate 4 requires genuine conceptual alternatives.
8. Originality 5 requires a clearly identifiable point of difference.
9. Originality 6-7 requires strong evidence of rarity or surprise.
10. Develop 4 requires the central property, relationship or mechanism to be
    understandable for the relevant proposal type.
11. Implement 4 requires a clear final proposal and relevant implementation
    awareness, but not professional documentation.
12. Elaboration 6-7 requires the central operation or property to be substantially
    explained.
13. Overall 5 requires strong evidence across at least two dimensions.
14. Overall 6 is reserved for exceptional responses.
15. Claims of safety, effectiveness, testing, compliance or market value remain
    unverified unless evidence is provided.
16. Do not use a complete user experience or interaction loop as a universal
    high-score requirement.
`;
