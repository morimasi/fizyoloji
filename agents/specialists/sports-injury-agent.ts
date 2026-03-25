/**
 * SPORTS INJURY SPECIALIST AGENT
 * Expert in sports medicine, acute injury management, and return-to-sport protocols
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class SportsInjuryAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = SportsInjuryAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'SportsInjurySpecialist',
      description: 'Sports Medicine Physician and Rehabilitation Specialist with expertise in athletic injuries and return-to-sport',
      systemPrompt: `You are a Sports Medicine Specialist with expertise in:

CORE COMPETENCIES:
- Acute injury assessment and management (PRICE/POLICE protocols)
- Sports-specific injury patterns and mechanisms
- Tissue healing timelines and biology
- Return-to-sport decision making
- Injury prevention strategies
- Performance optimization
- Concussion management
- Overuse injury management

COMMON SPORTS INJURIES:
- Ligament sprains (ACL, MCL, ankle sprains)
- Muscle strains (hamstring, groin, calf)
- Tendinopathies (Achilles, patellar, rotator cuff)
- Stress fractures
- Concussions
- Joint dislocations
- Overuse syndromes

ASSESSMENT FRAMEWORK:
1. Mechanism of Injury (MOI)
2. Acute Management (PEACE & LOVE protocol)
3. Severity Classification (Grade I/II/III)
4. Imaging Indications (Ottawa rules, etc.)
5. Differential Diagnosis
6. Prognosis and Timeline

REHABILITATION PHASES:
Phase 1: Acute Protection (0-72 hours)
- PEACE: Protection, Elevation, Avoid anti-inflammatories, Compress, Educate
Phase 2: Subacute Recovery (3 days - 2 weeks)
- LOVE: Load, Optimism, Vascularization, Exercise
Phase 3: Functional Restoration (2-6 weeks)
- Progressive loading, ROM restoration, strength building
Phase 4: Sport-Specific Training (6-12 weeks)
- Agility, plyometrics, sport-specific drills
Phase 5: Return-to-Sport (12+ weeks)
- Performance testing, gradual return, load monitoring

RETURN-TO-SPORT CRITERIA:
- Full pain-free ROM
- >90% strength symmetry
- Functional movement quality
- Sport-specific performance tests passed
- Psychological readiness
- Medical clearance

You provide evidence-based sports injury management with clear timelines and safe progression protocols.`,
      provider,
      skills: SportsInjuryAgent.initializeSkills(),
      autonomousMode: true,
      maxIterations: 15
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'acute_injury_management',
        description: 'Immediate injury assessment and management',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['acute', 'injury', 'sprain', 'strain', 'tear', 'trauma', 'mechanism'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `ACUTE INJURY MANAGEMENT ACTIVATED:
- Applying PEACE & LOVE protocol
- Assessing injury severity (Grade I/II/III)
- Determining need for imaging or referral
- Providing immediate management guidelines
- Establishing realistic timeline for recovery`,
            nextSkills: ['tissue_healing_timeline']
          };
        }
      },
      {
        name: 'tissue_healing_timeline',
        description: 'Apply tissue-specific healing timelines',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['healing', 'timeline', 'when', 'how long', 'recovery time'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TISSUE HEALING TIMELINE ACTIVATED:
- Ligament: 6-12 weeks (collagen remodeling)
- Muscle: 2-6 weeks (depends on grade)
- Tendon: 6-12 weeks (slow vascularization)
- Bone: 6-8 weeks (fracture healing)
- Cartilage: Very slow (limited healing capacity)
Planning rehabilitation phases based on tissue biology`,
            metadata: { timelineEstablished: true }
          };
        }
      },
      {
        name: 'return_to_sport_assessment',
        description: 'Evaluate readiness for return to sport',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['return', 'play', 'sport', 'compete', 'ready', 'clearance'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `RETURN-TO-SPORT ASSESSMENT ACTIVATED:
- Checking objective criteria (ROM, strength, functional tests)
- Assessing sport-specific performance
- Evaluating psychological readiness
- Planning graduated return protocol
- Establishing load monitoring strategy`,
            nextSkills: ['injury_prevention']
          };
        }
      },
      {
        name: 'injury_prevention',
        description: 'Design injury prevention strategies',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['prevent', 'prevention', 'avoid', 'reduce risk', 'protect'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `INJURY PREVENTION ACTIVATED:
- Identifying modifiable risk factors
- Planning neuromuscular training programs
- Implementing load management strategies
- Addressing movement asymmetries
- Providing education on injury mechanisms`,
            metadata: { preventionPlanned: true }
          };
        }
      },
      {
        name: 'concussion_management',
        description: 'Manage concussion/head injury',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['concussion', 'head injury', 'brain', 'dizziness', 'headache after impact'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `CONCUSSION MANAGEMENT ACTIVATED:
- Applying graduated return-to-play protocol
- Monitoring symptoms (SCAT5 tool)
- Ensuring medical clearance before contact
- Educating on second-impact syndrome risk
- Planning cognitive and physical rest progression`,
            metadata: { concussionProtocol: true }
          };
        }
      },
      {
        name: 'performance_testing',
        description: 'Conduct sport-specific performance tests',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['test', 'assessment', 'performance', 'functional', 'hop test'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `PERFORMANCE TESTING ACTIVATED:
- Single/Triple Hop Test (>90% symmetry)
- Y-Balance Test (dynamic stability)
- Strength Testing (isokinetic/isometric)
- Agility Tests (T-test, 505 test)
- Sport-specific movement assessment`,
            metadata: { testingPlanned: true }
          };
        }
      }
    ];
  }
}
