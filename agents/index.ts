/**
 * PHYSIOCORE SUPERPOWERS AGENT SYSTEM
 * Main export module for agent framework
 *
 * Inspired by obra/superpowers - bringing autonomous agent capabilities
 * to the PhysioCore AI platform
 */

// Core exports
export * from './core/ai-providers.ts';
export * from './core/agent-base.ts';
export * from './core/orchestrator.ts';

// Specialist agent exports
export { PhysiotherapistAgent } from './specialists/physiotherapist-agent.ts';
export { ExerciseSpecialistAgent } from './specialists/exercise-specialist-agent.ts';
export { SportsInjuryAgent } from './specialists/sports-injury-agent.ts';
export { MassageTherapistAgent } from './specialists/massage-therapist-agent.ts';
export { SoftwareCoderAgent } from './specialists/software-coder-agent.ts';
export { SpecialEducationAgent } from './specialists/special-education-agent.ts';

// Convenience functions
export {
  initializeOrchestrator,
  getOrchestrator,
  type AgentType,
  type AgentResponse,
  type OrchestratorConfig
} from './core/orchestrator.ts';

export {
  createAIProvider,
  type AIModelProvider,
  type AIProviderConfig,
  type AIMessage,
  type AIResponse
} from './core/ai-providers.ts';

export type { AIResponse as AgentAIResponse } from './core/ai-providers.ts';

export {
  type AgentContext,
  type AgentSkill,
  type SkillResult,
  type AgentConfig
} from './core/agent-base.ts';
