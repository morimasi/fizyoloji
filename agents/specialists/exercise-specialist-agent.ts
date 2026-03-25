/**
 * EXERCISE SPECIALIST AGENT
 * Expert in exercise science, biomechanics, and training prescription
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class ExerciseSpecialistAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = ExerciseSpecialistAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'ExerciseSpecialist',
      description: 'Exercise Scientist and Biomechanics Expert specializing in therapeutic exercise prescription and movement optimization',
      systemPrompt: `You are a Senior Exercise Specialist with expertise in:

CORE EXPERTISE:
- Exercise physiology and biomechanics
- Movement analysis and correction
- Strength and conditioning protocols
- Functional movement screening
- Periodization and progressive overload
- Exercise modification and regression/progression
- Muscle activation patterns
- Joint kinematics and kinetics

EXERCISE PRESCRIPTION FRAMEWORK:
1. Movement Assessment (FMS, SFMA)
2. Exercise Selection (based on movement pattern, muscle action, load)
3. Dosage Parameters (sets, reps, tempo, rest, frequency)
4. Progression/Regression Strategies
5. Biomechanical Optimization

TRAINING PRINCIPLES:
- Progressive Overload (systematic increase in stimulus)
- Specificity (SAID principle)
- Variation (prevent adaptation plateau)
- Recovery (tissue adaptation occurs during rest)
- Individual Differences (customize to patient capacity)

MOVEMENT PATTERNS:
- Squat pattern (hip/knee dominant)
- Hinge pattern (hip extension)
- Lunge pattern (single leg)
- Push patterns (horizontal/vertical)
- Pull patterns (horizontal/vertical)
- Rotation/anti-rotation
- Core stability (anti-extension, anti-lateral flexion, anti-rotation)

DOSAGE SCIENCE:
- Strength: 3-6 reps, 85-95% 1RM, 3-5 sets, 3-5 min rest
- Hypertrophy: 6-12 reps, 67-85% 1RM, 3-6 sets, 30-90 sec rest
- Endurance: 12-20+ reps, <67% 1RM, 2-3 sets, <30 sec rest
- Power: 1-5 reps, 30-90% 1RM, 3-5 sets, 2-5 min rest
- Therapeutic: Pain-guided, often 10-15 reps, moderate load

You provide precise exercise prescriptions with clear biomechanical rationale and progression pathways.`,
      provider,
      skills: ExerciseSpecialistAgent.initializeSkills(),
      autonomousMode: true,
      maxIterations: 12
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'movement_analysis',
        description: 'Analyze movement patterns and identify dysfunction',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['movement', 'pattern', 'biomechanics', 'form', 'technique'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `MOVEMENT ANALYSIS ACTIVATED:
- Assessing fundamental movement patterns
- Identifying compensatory strategies
- Analyzing joint kinematics and muscle activation
- Determining movement quality and efficiency`,
            nextSkills: ['exercise_selection']
          };
        }
      },
      {
        name: 'exercise_selection',
        description: 'Select optimal exercises based on goals and constraints',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['exercise', 'select', 'choose', 'recommend', 'which'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `EXERCISE SELECTION ACTIVATED:
- Matching exercises to movement patterns
- Considering joint actions and muscle groups
- Selecting based on equipment availability
- Prioritizing functional relevance`,
            nextSkills: ['dosage_calculation']
          };
        }
      },
      {
        name: 'dosage_calculation',
        description: 'Calculate precise exercise dosage parameters',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['dosage', 'sets', 'reps', 'intensity', 'volume', 'load'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `DOSAGE CALCULATION ACTIVATED:
- Determining training goal (strength, hypertrophy, endurance, therapeutic)
- Calculating sets, reps, and intensity
- Setting tempo and rest periods
- Planning frequency and volume`,
            metadata: { dosageCalculated: true }
          };
        }
      },
      {
        name: 'progression_planning',
        description: 'Design exercise progression pathway',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['progress', 'advance', 'next', 'harder', 'easier', 'modify'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `PROGRESSION PLANNING ACTIVATED:
- Establishing progression criteria
- Planning regression options
- Designing advancement pathway
- Setting overload variables (load, volume, complexity, ROM)`,
            metadata: { progressionPlanned: true }
          };
        }
      },
      {
        name: 'biomechanical_optimization',
        description: 'Optimize exercise technique and biomechanics',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['biomechanics', 'technique', 'form', 'alignment', 'position'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `BIOMECHANICAL OPTIMIZATION ACTIVATED:
- Analyzing joint angles and muscle length-tension relationships
- Optimizing force vectors and moment arms
- Ensuring proper alignment and stability
- Providing cueing strategies for optimal technique`,
            metadata: { biomechanicsOptimized: true }
          };
        }
      },
      {
        name: 'exercise_modification',
        description: 'Modify exercises for individual constraints',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['modify', 'adapt', 'alternative', 'substitute', 'cannot'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `EXERCISE MODIFICATION ACTIVATED:
- Adapting for pain or limitation
- Providing exercise alternatives
- Modifying based on equipment availability
- Scaling difficulty to individual capacity`,
            metadata: { modificationsProvided: true }
          };
        }
      }
    ];
  }

  async brainstorm(problem: string): Promise<string[]> {
    const ideas = await super.brainstorm(problem);

    const enhancedIdeas = [
      `Movement pattern analysis: Break down into fundamental movement components`,
      `Progressive overload strategy: Plan systematic increase in training stimulus`,
      `Exercise variation library: Select from multiple exercise options for same pattern`,
      ...ideas
    ];

    return enhancedIdeas;
  }

  async createPlan(objective: string): Promise<string[]> {
    const basePlan = await super.createPlan(objective);

    const enhancedPlan = [
      `MOVEMENT ASSESSMENT: Evaluate fundamental movement patterns`,
      `GOAL IDENTIFICATION: Determine training objectives (strength/hypertrophy/endurance/therapeutic)`,
      `EXERCISE SELECTION: Choose exercises based on movement patterns and goals`,
      `DOSAGE PRESCRIPTION: Calculate sets, reps, intensity, tempo, rest`,
      `PROGRESSION PATHWAY: Design regression-baseline-progression continuum`,
      `TECHNIQUE OPTIMIZATION: Provide biomechanical cues for optimal performance`,
      `VOLUME MANAGEMENT: Calculate total training volume and recovery needs`,
      `PERIODIZATION: Plan training phases for continued adaptation`,
      ...basePlan
    ];

    return enhancedPlan;
  }
}
