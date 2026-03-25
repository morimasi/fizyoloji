/**
 * AGENT-ENHANCED AI SERVICE
 * Integrates superpowers agent framework with existing AI services
 */

import { getAI, isApiKeyError } from './ai-core.ts';
import { initializeOrchestrator, getOrchestrator, type OrchestratorConfig } from './agents/index.ts';

export type AgentType =
  | 'physiotherapist'
  | 'exercise_specialist'
  | 'sports_injury'
  | 'massage_therapist'
  | 'software_coder'
  | 'special_education';

/**
 * Initialize agent system with configuration
 */
export function initializeAgentSystem(config?: Partial<OrchestratorConfig>) {
  const defaultConfig: OrchestratorConfig = {
    defaultProvider: 'gemini',
    apiKeys: {
      gemini: process.env.API_KEY || ''
    },
    autoSelectAgents: true,
    maxConcurrentAgents: 3
  };

  const finalConfig = { ...defaultConfig, ...config };
  return initializeOrchestrator(finalConfig);
}

/**
 * Query with autonomous agent selection
 */
export async function queryWithAgents(
  input: string,
  context?: any
) {
  try {
    // Ensure orchestrator is initialized
    let orchestrator;
    try {
      orchestrator = getOrchestrator();
    } catch {
      orchestrator = initializeAgentSystem();
    }

    // Execute autonomously - agents will be selected automatically
    const responses = await orchestrator.executeAutonomously(input, context);

    return responses;
  } catch (err) {
    if (isApiKeyError(err)) {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) await aistudio.openSelectKey();
    }
    throw err;
  }
}

/**
 * Query with specific agent
 */
export async function queryWithSpecificAgent(
  input: string,
  agentType: AgentType,
  context?: any
) {
  try {
    let orchestrator;
    try {
      orchestrator = getOrchestrator();
    } catch {
      orchestrator = initializeAgentSystem();
    }

    const responses = await orchestrator.executeWithAgents(input, [agentType], context);
    return responses[0];
  } catch (err) {
    if (isApiKeyError(err)) {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) await aistudio.openSelectKey();
    }
    throw err;
  }
}

/**
 * Stream response from specific agent
 */
export async function streamAgentResponse(
  input: string,
  agentType: AgentType,
  onChunk: (chunk: string) => void,
  context?: any
) {
  try {
    let orchestrator;
    try {
      orchestrator = getOrchestrator();
    } catch {
      orchestrator = initializeAgentSystem();
    }

    return await orchestrator.executeStream(input, agentType, onChunk, context);
  } catch (err) {
    if (isApiKeyError(err)) {
      const aistudio = (window as any).aistudio;
      if (aistudio?.openSelectKey) await aistudio.openSelectKey();
    }
    throw err;
  }
}

/**
 * Get available agent types
 */
export function getAvailableAgents(): AgentType[] {
  return [
    'physiotherapist',
    'exercise_specialist',
    'sports_injury',
    'massage_therapist',
    'software_coder',
    'special_education'
  ];
}

// Re-export existing AI service functions
export * from './ai-service.ts';
