/**
 * AGENT ORCHESTRATOR - AUTONOMOUS ACTIVATION SYSTEM
 * Inspired by obra/superpowers framework
 * Manages agent lifecycle and autonomous activation
 */

import { BaseAgent, AgentContext } from '../core/agent-base.ts';
import type { AIResponse } from '../core/ai-providers.ts';
import { PhysiotherapistAgent } from '../specialists/physiotherapist-agent.ts';
import { ExerciseSpecialistAgent } from '../specialists/exercise-specialist-agent.ts';
import { SportsInjuryAgent } from '../specialists/sports-injury-agent.ts';
import { MassageTherapistAgent } from '../specialists/massage-therapist-agent.ts';
import { SoftwareCoderAgent } from '../specialists/software-coder-agent.ts';
import { SpecialEducationAgent } from '../specialists/special-education-agent.ts';
import { createAIProvider, AIProviderConfig, AIModelProvider } from '../core/ai-providers.ts';

export type AgentType =
  | 'physiotherapist'
  | 'exercise_specialist'
  | 'sports_injury'
  | 'massage_therapist'
  | 'software_coder'
  | 'special_education';

export interface AgentOrchestrator {
  selectAgent(input: string, context?: AgentContext): AgentType[];
  executeWithAgents(input: string, agentTypes: AgentType[], context?: AgentContext): Promise<AgentResponse[]>;
  executeAutonomously(input: string, context?: AgentContext): Promise<AgentResponse[]>;
}

export interface AgentResponse {
  agentType: AgentType;
  response: AIResponse;
  skillsActivated: string[];
  confidence: number;
}

export interface OrchestratorConfig {
  defaultProvider: AIModelProvider;
  apiKeys: {
    openai?: string;
    claude?: string;
    gemini?: string;
  };
  autoSelectAgents?: boolean;
  maxConcurrentAgents?: number;
}

/**
 * Main orchestrator class for managing all agents
 */
export class SuperpowersOrchestrator implements AgentOrchestrator {
  private config: OrchestratorConfig;
  private agents: Map<AgentType, BaseAgent>;
  private providerConfig: AIProviderConfig;

  constructor(config: OrchestratorConfig) {
    this.config = config;
    this.agents = new Map();

    // Set up provider configuration
    this.providerConfig = {
      provider: config.defaultProvider,
      apiKey: config.apiKeys[config.defaultProvider] || '',
      temperature: 0.7
    };

    // Initialize all agents
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const provider = createAIProvider(this.providerConfig);

    this.agents.set('physiotherapist', new PhysiotherapistAgent(provider));
    this.agents.set('exercise_specialist', new ExerciseSpecialistAgent(provider));
    this.agents.set('sports_injury', new SportsInjuryAgent(provider));
    this.agents.set('massage_therapist', new MassageTherapistAgent(provider));
    this.agents.set('software_coder', new SoftwareCoderAgent(provider));
    this.agents.set('special_education', new SpecialEducationAgent(provider));
  }

  /**
   * Intelligent agent selection based on input analysis
   * Uses keyword matching and context analysis
   */
  selectAgent(input: string, context?: AgentContext): AgentType[] {
    const selectedAgents: AgentType[] = [];
    const lowerInput = input.toLowerCase();

    // Define keyword patterns for each agent
    const patterns: Record<AgentType, string[]> = {
      physiotherapist: [
        'pain', 'ağrı', 'rehabilitation', 'rehab', 'therapy', 'terapi',
        'assessment', 'değerlendirme', 'diagnosis', 'teşhis', 'treatment plan',
        'physiotherapy', 'fizyoterapi', 'patient', 'hasta', 'clinical',
        'injury', 'yaralanma', 'recovery', 'iyileşme', 'manual therapy'
      ],
      exercise_specialist: [
        'exercise', 'egzersiz', 'workout', 'antrenman', 'training', 'eğitim',
        'strength', 'kuvvet', 'sets', 'reps', 'tekrar', 'progression',
        'movement', 'hareket', 'biomechanics', 'biyomekanik', 'technique',
        'dosage', 'doz', 'volume', 'hacim', 'intensity', 'yoğunluk'
      ],
      sports_injury: [
        'sports', 'spor', 'athlete', 'atlet', 'competition', 'yarışma',
        'sprain', 'burkulma', 'strain', 'gerilme', 'tear', 'yırtık',
        'acute', 'akut', 'concussion', 'sarsıntı', 'return to sport',
        'performance', 'performans', 'ligament', 'bağ', 'tendon', 'kiriş'
      ],
      massage_therapist: [
        'massage', 'masaj', 'soft tissue', 'yumuşak doku', 'myofascial',
        'trigger point', 'tetik nokta', 'knot', 'düğüm', 'tight', 'gergin',
        'stiff', 'sert', 'tension', 'gerginlik', 'manual', 'manipülasyon',
        'tissue', 'doku', 'release', 'gevşetme', 'mobilization'
      ],
      software_coder: [
        'code', 'kod', 'programming', 'programlama', 'bug', 'hata',
        'feature', 'özellik', 'develop', 'geliştir', 'implement', 'uygula',
        'fix', 'düzelt', 'software', 'yazılım', 'application', 'uygulama',
        'component', 'bileşen', 'function', 'fonksiyon', 'api', 'database'
      ],
      special_education: [
        'special needs', 'özel eğitim', 'autism', 'otizm', 'disability',
        'engellilik', 'adaptive', 'uyarlanmış', 'iep', 'sensory', 'duyusal',
        'developmental', 'gelişimsel', 'cerebral palsy', 'down syndrome',
        'learning', 'öğrenme', 'behavioral', 'davranışsal', 'modification'
      ]
    };

    // Calculate confidence scores for each agent
    const scores: Record<AgentType, number> = {
      physiotherapist: 0,
      exercise_specialist: 0,
      sports_injury: 0,
      massage_therapist: 0,
      software_coder: 0,
      special_education: 0
    };

    // Count keyword matches
    for (const [agentType, keywords] of Object.entries(patterns)) {
      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          scores[agentType as AgentType] += 1;
        }
      }
    }

    // Apply the "1% Rule" from superpowers: if there's any chance an agent is relevant, include it
    const threshold = 1; // At least 1 keyword match
    for (const [agentType, score] of Object.entries(scores)) {
      if (score >= threshold) {
        selectedAgents.push(agentType as AgentType);
      }
    }

    // If no agents selected, use physiotherapist as default for medical queries
    if (selectedAgents.length === 0) {
      // Check if this is a medical/health query
      const medicalKeywords = ['health', 'sağlık', 'medical', 'tıbbi', 'body', 'vücut'];
      const isMedical = medicalKeywords.some(k => lowerInput.includes(k));

      if (isMedical) {
        selectedAgents.push('physiotherapist');
      }
    }

    // Sort by confidence (highest first)
    selectedAgents.sort((a, b) => scores[b] - scores[a]);

    // Limit concurrent agents
    const maxAgents = this.config.maxConcurrentAgents || 3;
    return selectedAgents.slice(0, maxAgents);
  }

  /**
   * Execute with specific agents
   */
  async executeWithAgents(
    input: string,
    agentTypes: AgentType[],
    context?: AgentContext
  ): Promise<AgentResponse[]> {
    const responses: AgentResponse[] = [];

    const executionContext: AgentContext = context || {
      input,
      history: [],
      metadata: {}
    };

    // Execute agents in parallel
    const promises = agentTypes.map(async (agentType) => {
      const agent = this.agents.get(agentType);
      if (!agent) {
        console.warn(`Agent ${agentType} not found`);
        return null;
      }

      try {
        const response = await agent.execute(executionContext);
        const skillsActivated = agent.getSkills().map(s => s.name);

        return {
          agentType,
          response,
          skillsActivated,
          confidence: 0.85 // Placeholder for now
        } as AgentResponse;
      } catch (error) {
        console.error(`Agent ${agentType} execution failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Filter out failed executions
    for (const result of results) {
      if (result) {
        responses.push(result);
      }
    }

    return responses;
  }

  /**
   * Autonomous execution - automatically select and execute relevant agents
   */
  async executeAutonomously(
    input: string,
    context?: AgentContext
  ): Promise<AgentResponse[]> {
    // Phase 1: Select relevant agents
    const selectedAgents = this.selectAgent(input, context);

    console.log(`🤖 Autonomous Agent Selection: ${selectedAgents.join(', ')}`);

    // Phase 2: Execute selected agents
    const responses = await this.executeWithAgents(input, selectedAgents, context);

    return responses;
  }

  /**
   * Execute with streaming response
   */
  async executeStream(
    input: string,
    agentType: AgentType,
    onChunk: (chunk: string) => void,
    context?: AgentContext
  ): Promise<AIResponse> {
    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent ${agentType} not found`);
    }

    const executionContext: AgentContext = context || {
      input,
      history: [],
      metadata: {}
    };

    return await agent.executeStream(executionContext, onChunk);
  }

  /**
   * Get agent by type
   */
  getAgent(agentType: AgentType): BaseAgent | undefined {
    return this.agents.get(agentType);
  }

  /**
   * Update provider configuration
   */
  updateProvider(provider: AIModelProvider, apiKey: string): void {
    this.providerConfig = {
      ...this.providerConfig,
      provider,
      apiKey
    };

    // Reinitialize agents with new provider
    this.initializeAgents();
  }

  /**
   * Reset all agents
   */
  resetAll(): void {
    for (const agent of this.agents.values()) {
      agent.reset();
    }
  }
}

/**
 * Global orchestrator instance (singleton pattern)
 */
let globalOrchestrator: SuperpowersOrchestrator | null = null;

export function initializeOrchestrator(config: OrchestratorConfig): SuperpowersOrchestrator {
  globalOrchestrator = new SuperpowersOrchestrator(config);
  return globalOrchestrator;
}

export function getOrchestrator(): SuperpowersOrchestrator {
  if (!globalOrchestrator) {
    throw new Error('Orchestrator not initialized. Call initializeOrchestrator first.');
  }
  return globalOrchestrator;
}
