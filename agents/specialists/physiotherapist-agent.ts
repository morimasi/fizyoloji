/**
 * PHYSIOTHERAPIST EXPERT AGENT
 * Premium specialized agent with deep expertise in physiotherapy
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class PhysiotherapistAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = PhysiotherapistAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'PhysiotherapistExpert',
      description: 'Senior Clinical Physiotherapist with expertise in musculoskeletal rehabilitation, pain management, and evidence-based practice',
      systemPrompt: `You are a Senior Clinical Physiotherapist with 20+ years of experience. Your expertise includes:

CORE COMPETENCIES:
- Musculoskeletal assessment and diagnosis (ICF framework)
- Evidence-based treatment planning (GRADE methodology)
- Manual therapy techniques (Maitland, Mulligan, McKenzie)
- Pain neuroscience education
- Movement analysis and biomechanics
- Progressive rehabilitation protocols
- Clinical reasoning using hypothetico-deductive model

ASSESSMENT PROTOCOLS:
1. Subjective Assessment (SOCRATES for pain)
2. Objective Examination (posture, ROM, strength, special tests)
3. Differential Diagnosis
4. Treatment Planning with SMART goals
5. Outcome Measures (NPRS, ODI, DASH, etc.)

TREATMENT PRINCIPLES:
- Evidence-based practice (latest RCTs, systematic reviews)
- Patient-centered care
- Biopsychosocial approach
- Progressive loading principles
- Tissue healing timelines
- Red flag screening
- Dosage prescription based on pain levels

CLINICAL REASONING:
- Always consider differential diagnosis
- Screen for serious pathology (red flags)
- Assess psychosocial factors (yellow flags)
- Provide evidence-based rationale
- Adapt treatment based on response

You communicate clearly, educate patients about their condition, and provide specific, actionable treatment plans.`,
      provider,
      skills,
      autonomousMode: true,
      maxIterations: 15
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'clinical_assessment',
        description: 'Perform comprehensive clinical assessment',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['assess', 'evaluate', 'examination', 'pain', 'injury', 'diagnosis'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `CLINICAL ASSESSMENT ACTIVATED:
- Conducting systematic subjective and objective examination
- Screening for red flags and contraindications
- Identifying movement patterns and functional limitations
- Formulating differential diagnosis`,
            nextSkills: ['treatment_planning']
          };
        }
      },
      {
        name: 'treatment_planning',
        description: 'Create evidence-based treatment plan',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['treatment', 'plan', 'therapy', 'protocol', 'rehabilitation'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TREATMENT PLANNING ACTIVATED:
- Establishing SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
- Selecting evidence-based interventions
- Determining appropriate dosage and progression
- Planning outcome measures for monitoring`,
            nextSkills: ['exercise_prescription']
          };
        }
      },
      {
        name: 'exercise_prescription',
        description: 'Prescribe therapeutic exercises with precise dosage',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['exercise', 'movement', 'strengthen', 'stretch', 'mobilize'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `EXERCISE PRESCRIPTION ACTIVATED:
- Applying progressive loading principles
- Considering tissue healing stages
- Calculating appropriate sets, reps, and intensity
- Planning exercise progression pathway`,
            metadata: { dosageCalculated: true }
          };
        }
      },
      {
        name: 'pain_management',
        description: 'Implement pain neuroscience education and management strategies',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const painIndicators = ['pain', 'hurt', 'ache', 'sore', 'discomfort', 'ağrı'];
          return painIndicators.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `PAIN MANAGEMENT ACTIVATED:
- Applying pain neuroscience education principles
- Explaining pain mechanisms to patient
- Implementing graded exposure approach
- Using pain as a guide for dosage (not avoiding movement)`,
            metadata: { painEducation: true }
          };
        }
      },
      {
        name: 'manual_therapy',
        description: 'Apply manual therapy techniques when indicated',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['manual', 'mobilization', 'manipulation', 'massage', 'soft tissue'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `MANUAL THERAPY ACTIVATED:
- Selecting appropriate manual techniques (mobilization, manipulation, soft tissue)
- Considering contraindications and precautions
- Planning manual therapy as adjunct to active treatment`,
            metadata: { manualTherapyPlanned: true }
          };
        }
      },
      {
        name: 'red_flag_screening',
        description: 'Screen for serious pathology requiring medical referral',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          return true; // Always screen for red flags
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `RED FLAG SCREENING ACTIVATED:
- Screening for fracture, infection, malignancy, cauda equina
- Assessing need for medical referral
- Identifying contraindications to treatment`,
            metadata: { redFlagScreened: true }
          };
        }
      }
    ];
  }

  async brainstorm(problem: string): Promise<string[]> {
    const ideas = await super.brainstorm(problem);

    // Add domain-specific brainstorming enhancements
    const enhancedIdeas = [
      `Evidence-based approach: Review latest systematic reviews and clinical guidelines`,
      `Biopsychosocial assessment: Consider physical, psychological, and social factors`,
      `Differential diagnosis: Rule out serious pathology and identify primary drivers`,
      ...ideas
    ];

    return enhancedIdeas;
  }

  async createPlan(objective: string): Promise<string[]> {
    const basePlan = await super.createPlan(objective);

    // Add physiotherapy-specific planning structure
    const enhancedPlan = [
      `SUBJECTIVE ASSESSMENT: Gather comprehensive patient history`,
      `OBJECTIVE EXAMINATION: Perform systematic physical assessment`,
      `CLINICAL REASONING: Formulate differential diagnosis`,
      `GOAL SETTING: Establish SMART goals with patient`,
      `TREATMENT PLAN: Select evidence-based interventions`,
      `DOSAGE PRESCRIPTION: Calculate appropriate exercise parameters`,
      `OUTCOME MEASURES: Select valid and reliable assessment tools`,
      `PROGRESSION PLAN: Outline criteria for advancement`,
      `SAFETY SCREENING: Identify contraindications and precautions`,
      ...basePlan
    ];

    return enhancedPlan;
  }
}
