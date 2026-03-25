/**
 * MASSAGE THERAPIST AGENT
 * Expert in therapeutic massage, manual therapy, and soft tissue techniques
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class MassageTherapistAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = MassageTherapistAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'MassageTherapist',
      description: 'Registered Massage Therapist specializing in therapeutic massage and soft tissue mobilization',
      systemPrompt: `You are a Registered Massage Therapist (RMT) with expertise in:

CORE COMPETENCIES:
- Therapeutic massage techniques
- Soft tissue mobilization and manipulation
- Trigger point therapy
- Myofascial release
- Deep tissue massage
- Sports massage
- Lymphatic drainage
- Muscle energy techniques

MASSAGE MODALITIES:
1. Swedish Massage (relaxation, circulation)
2. Deep Tissue Massage (chronic tension, adhesions)
3. Sports Massage (pre/post event, maintenance)
4. Trigger Point Therapy (myofascial pain)
5. Myofascial Release (fascial restrictions)
6. Manual Lymphatic Drainage (edema reduction)
7. Cross-Friction Massage (tendon/ligament healing)
8. Instrument-Assisted Soft Tissue Mobilization (IASTM)

ASSESSMENT:
- Postural analysis
- Palpation for tissue texture, tenderness, asymmetry
- Range of motion assessment
- Muscle length testing
- Trigger point identification
- Movement pattern observation

TREATMENT PRINCIPLES:
- Tissue-specific pressure and technique
- Respect pain tolerance (therapeutic window)
- Work within tissue extensibility
- Address both local and regional dysfunction
- Combine with movement/exercise
- Progressive tissue adaptation

CONTRAINDICATIONS:
Absolute: DVT, acute infection, open wounds, severe inflammation
Relative: Recent surgery, pregnancy, osteoporosis, medications

THERAPEUTIC EFFECTS:
- Pain reduction (gate control theory, endorphins)
- Improved circulation and lymphatic flow
- Reduced muscle tension and trigger points
- Enhanced tissue extensibility
- Stress reduction and relaxation
- Improved sleep quality

You provide safe, effective massage therapy recommendations with clear technique descriptions and therapeutic rationale.`,
      provider,
      skills: MassageTherapistAgent.initializeSkills(),
      autonomousMode: true,
      maxIterations: 10
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'tissue_assessment',
        description: 'Assess soft tissue quality and restrictions',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['tight', 'stiff', 'knot', 'tension', 'muscle', 'tissue'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TISSUE ASSESSMENT ACTIVATED:
- Palpating for tissue texture abnormalities
- Identifying trigger points and tender points
- Assessing muscle tone and length
- Evaluating fascial restrictions
- Determining tissue quality (fibrosis, adhesions)`,
            nextSkills: ['technique_selection']
          };
        }
      },
      {
        name: 'technique_selection',
        description: 'Select appropriate massage techniques',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['massage', 'treatment', 'technique', 'therapy', 'work on'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TECHNIQUE SELECTION ACTIVATED:
- Matching technique to tissue condition
- Considering acute vs chronic presentation
- Selecting pressure and stroke type
- Planning treatment duration and frequency
- Combining techniques for optimal effect`,
            nextSkills: ['treatment_application']
          };
        }
      },
      {
        name: 'treatment_application',
        description: 'Apply therapeutic massage techniques',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['apply', 'perform', 'do', 'treatment', 'session'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TREATMENT APPLICATION ACTIVATED:
- Preparing tissue with warming techniques
- Applying specific therapeutic techniques
- Monitoring patient response and pain levels
- Adjusting pressure and depth appropriately
- Finishing with integrative strokes`,
            metadata: { treatmentApplied: true }
          };
        }
      },
      {
        name: 'trigger_point_therapy',
        description: 'Address myofascial trigger points',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['trigger point', 'knot', 'referred pain', 'tender spot'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TRIGGER POINT THERAPY ACTIVATED:
- Identifying active vs latent trigger points
- Applying ischemic compression technique
- Using muscle energy techniques for release
- Addressing perpetuating factors
- Providing self-release strategies`,
            metadata: { triggerPointsAddressed: true }
          };
        }
      },
      {
        name: 'contraindication_screening',
        description: 'Screen for massage contraindications',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          return true; // Always screen for safety
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `CONTRAINDICATION SCREENING ACTIVATED:
- Checking for absolute contraindications (DVT, infection)
- Assessing relative contraindications
- Identifying areas to avoid or modify
- Ensuring safe treatment application
- Planning appropriate precautions`,
            metadata: { safetyScreened: true }
          };
        }
      },
      {
        name: 'self_care_education',
        description: 'Teach self-massage and tissue care',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['self', 'home', 'myself', 'own', 'between sessions'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `SELF-CARE EDUCATION ACTIVATED:
- Teaching foam rolling techniques
- Demonstrating self-massage tools (ball, stick)
- Providing stretching recommendations
- Planning home care frequency
- Setting realistic expectations`,
            metadata: { selfCareProvided: true }
          };
        }
      }
    ];
  }
}
