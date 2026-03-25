/**
 * SPECIAL EDUCATION TEACHER AGENT
 * Expert in adaptive learning, therapeutic education, and special needs support
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class SpecialEducationAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = SpecialEducationAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'SpecialEducationTeacher',
      description: 'Special Education Teacher specializing in adaptive physical education and therapeutic learning',
      systemPrompt: `You are a Special Education Teacher with expertise in:

CORE COMPETENCIES:
- Individualized Education Plans (IEP)
- Adaptive physical education
- Therapeutic movement and exercise
- Sensory integration
- Behavioral support strategies
- Differentiated instruction
- Assistive technology
- Universal Design for Learning (UDL)

SPECIAL NEEDS POPULATIONS:
- Autism Spectrum Disorder (ASD)
- Cerebral Palsy
- Down Syndrome
- Developmental Coordination Disorder (DCD)
- Intellectual Disabilities
- ADHD and Executive Function challenges
- Sensory Processing Disorders
- Physical Disabilities

ADAPTIVE EXERCISE PRINCIPLES:
- Task analysis and breakdown
- Skill progression hierarchy
- Multi-sensory instruction
- Visual supports and modeling
- Positive reinforcement
- Errorless learning strategies
- Repetition and consistency
- Individualized modifications

ASSESSMENT TOOLS:
- Gross Motor Function Classification System (GMFCS)
- Peabody Developmental Motor Scales
- Movement Assessment Battery for Children (MABC)
- Sensory Profile
- Functional Independence Measure (WeeFIM)

INSTRUCTIONAL STRATEGIES:
1. Visual Supports (picture schedules, video modeling)
2. Task Analysis (breaking down complex movements)
3. Prompting Hierarchy (full physical to independent)
4. Shaping and Chaining
5. Social Stories for exercise understanding
6. Sensory Diet integration
7. Structured routines and transitions

COMMUNICATION:
- Clear, concrete language
- Visual and gestural cues
- Augmentative and Alternative Communication (AAC)
- Social narratives
- Choice-making opportunities
- Positive behavior support

COLLABORATION:
- Working with occupational therapists
- Coordinating with physical therapists
- Family engagement and training
- School and community integration

You provide compassionate, evidence-based special education support with individualized adaptations for each learner.`,
      provider,
      skills: SpecialEducationAgent.initializeSkills(),
      autonomousMode: true,
      maxIterations: 12
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'individual_assessment',
        description: 'Assess individual abilities and needs',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['assess', 'evaluate', 'abilities', 'needs', 'level'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `INDIVIDUAL ASSESSMENT ACTIVATED:
- Assessing current motor and cognitive abilities
- Identifying strengths and challenges
- Evaluating sensory preferences and sensitivities
- Determining communication style
- Understanding behavioral patterns and triggers`,
            nextSkills: ['iep_development']
          };
        }
      },
      {
        name: 'iep_development',
        description: 'Develop individualized education plan',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['iep', 'plan', 'goals', 'individualized', 'program'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `IEP DEVELOPMENT ACTIVATED:
- Setting SMART goals appropriate to ability level
- Identifying necessary accommodations and modifications
- Planning adaptive equipment needs
- Establishing baseline and progress measures
- Coordinating with multidisciplinary team`,
            nextSkills: ['adaptive_instruction']
          };
        }
      },
      {
        name: 'adaptive_instruction',
        description: 'Design adaptive teaching strategies',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['teach', 'instruct', 'adapt', 'modify', 'how to'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `ADAPTIVE INSTRUCTION ACTIVATED:
- Breaking tasks into manageable steps
- Creating visual supports and schedules
- Planning multi-sensory teaching approaches
- Implementing appropriate prompting strategies
- Designing errorless learning experiences`,
            metadata: { instructionPlanned: true }
          };
        }
      },
      {
        name: 'sensory_integration',
        description: 'Address sensory processing needs',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['sensory', 'overstimulated', 'calming', 'sensory diet', 'regulation'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `SENSORY INTEGRATION ACTIVATED:
- Identifying sensory seeking/avoiding behaviors
- Planning sensory diet activities
- Creating calming and alerting strategies
- Modifying environment for sensory needs
- Integrating sensory breaks into routine`,
            metadata: { sensorySupport: true }
          };
        }
      },
      {
        name: 'behavior_support',
        description: 'Implement positive behavior strategies',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['behavior', 'motivation', 'engagement', 'participation', 'challenge'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `BEHAVIOR SUPPORT ACTIVATED:
- Using positive reinforcement systems
- Implementing visual schedules and timers
- Creating choice-making opportunities
- Planning motivating activities
- Addressing challenging behaviors proactively`,
            metadata: { behaviorPlan: true }
          };
        }
      },
      {
        name: 'family_collaboration',
        description: 'Engage and train family members',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['family', 'parent', 'caregiver', 'home', 'support'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `FAMILY COLLABORATION ACTIVATED:
- Providing family education and training
- Sharing strategies for home implementation
- Creating home exercise programs
- Building family capacity and confidence
- Maintaining regular communication`,
            metadata: { familyEngaged: true }
          };
        }
      },
      {
        name: 'adaptive_equipment',
        description: 'Recommend assistive technology and equipment',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['equipment', 'assistive', 'adaptive', 'technology', 'tools'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `ADAPTIVE EQUIPMENT ACTIVATED:
- Identifying appropriate assistive devices
- Planning environmental modifications
- Recommending communication supports
- Suggesting adaptive exercise equipment
- Training on proper equipment use`,
            metadata: { equipmentRecommended: true }
          };
        }
      }
    ];
  }
}
