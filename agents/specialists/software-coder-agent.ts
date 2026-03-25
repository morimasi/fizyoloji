/**
 * SOFTWARE CODER AGENT
 * Expert software developer for application enhancement and maintenance
 */

import { AutonomousAgent, AgentConfig, AgentContext, AgentSkill, SkillResult } from '../core/agent-base.ts';
import { AIProvider } from '../core/ai-providers.ts';

export class SoftwareCoderAgent extends AutonomousAgent {
  constructor(provider: AIProvider) {
    const skills = SoftwareCoderAgent.initializeSkills();
    const config: AgentConfig = {
      name: 'SoftwareCoder',
      description: 'Senior Full-Stack Developer specializing in React, TypeScript, and AI-powered applications',
      systemPrompt: `You are a Senior Software Developer with expertise in:

TECHNICAL STACK:
- Frontend: React, TypeScript, Tailwind CSS, Vite
- State Management: React hooks, Context API
- Animation: Framer Motion, Remotion
- 3D Graphics: Three.js, React Three Fiber
- AI Integration: Google Gemini, OpenAI, Claude APIs
- Build Tools: Vite, npm, modern ES modules

DEVELOPMENT PRINCIPLES:
- Clean Code (readable, maintainable, DRY)
- SOLID principles
- Test-Driven Development
- Component-based architecture
- Performance optimization
- Accessibility (WCAG 2.1)
- Security best practices

CODE QUALITY:
- Type safety with TypeScript
- Error handling and validation
- Consistent code style
- Comprehensive documentation
- Unit and integration testing
- Code review best practices

ARCHITECTURAL PATTERNS:
- Component composition
- Container/Presentational pattern
- Custom hooks for logic reuse
- Service layer for API calls
- Repository pattern for data access
- Event-driven architecture

PERFORMANCE:
- React rendering optimization
- Code splitting and lazy loading
- Memoization strategies
- Bundle size optimization
- Caching strategies
- Debouncing and throttling

You write production-ready, well-documented code following best practices and modern standards.`,
      provider,
      skills,
      autonomousMode: true,
      maxIterations: 20
    };

    super(config);
  }

  private static initializeSkills(): AgentSkill[] {
    return [
      {
        name: 'code_analysis',
        description: 'Analyze existing codebase structure and patterns',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['analyze', 'review', 'understand', 'explain', 'how does'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `CODE ANALYSIS ACTIVATED:
- Reviewing codebase architecture and patterns
- Identifying dependencies and data flow
- Analyzing component structure
- Assessing code quality and maintainability
- Documenting findings and recommendations`,
            nextSkills: ['design_planning']
          };
        }
      },
      {
        name: 'design_planning',
        description: 'Design software architecture and implementation plan',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['design', 'architecture', 'plan', 'structure', 'organize'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `DESIGN PLANNING ACTIVATED:
- Designing component architecture
- Planning data models and state management
- Identifying reusable patterns
- Creating implementation roadmap
- Considering scalability and maintainability`,
            nextSkills: ['implementation']
          };
        }
      },
      {
        name: 'implementation',
        description: 'Implement features with clean, typed code',
        priority: 9,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['implement', 'create', 'build', 'develop', 'add', 'write'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `IMPLEMENTATION ACTIVATED:
- Writing clean, type-safe TypeScript code
- Creating reusable React components
- Implementing proper error handling
- Following established code patterns
- Adding comprehensive documentation`,
            nextSkills: ['testing']
          };
        }
      },
      {
        name: 'testing',
        description: 'Test code functionality and edge cases',
        priority: 8,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['test', 'verify', 'check', 'validate'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `TESTING ACTIVATED:
- Writing unit tests for components
- Testing edge cases and error scenarios
- Verifying TypeScript type safety
- Running integration tests
- Ensuring accessibility compliance`,
            metadata: { tested: true }
          };
        }
      },
      {
        name: 'debugging',
        description: 'Debug issues and fix bugs',
        priority: 10,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['bug', 'error', 'issue', 'problem', 'not working', 'fix'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `DEBUGGING ACTIVATED:
- Analyzing error messages and stack traces
- Identifying root cause of issues
- Testing hypotheses systematically
- Implementing fixes with verification
- Preventing similar issues in future`,
            metadata: { debugged: true }
          };
        }
      },
      {
        name: 'performance_optimization',
        description: 'Optimize code for performance',
        priority: 7,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['optimize', 'performance', 'slow', 'faster', 'improve'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `PERFORMANCE OPTIMIZATION ACTIVATED:
- Profiling and identifying bottlenecks
- Implementing React optimization techniques
- Optimizing bundle size and loading
- Adding caching strategies
- Improving rendering performance`,
            metadata: { optimized: true }
          };
        }
      },
      {
        name: 'code_refactoring',
        description: 'Refactor code for better maintainability',
        priority: 6,
        shouldActivate: (context: AgentContext) => {
          const keywords = ['refactor', 'clean up', 'improve', 'restructure'];
          return keywords.some(k => context.input.toLowerCase().includes(k));
        },
        execute: async (context: AgentContext): Promise<SkillResult> => {
          return {
            success: true,
            output: `CODE REFACTORING ACTIVATED:
- Applying SOLID principles
- Extracting reusable components
- Improving code readability
- Reducing complexity
- Maintaining backward compatibility`,
            metadata: { refactored: true }
          };
        }
      }
    ];
  }
}
