/**
 * PHYSIOCORE AGENT FRAMEWORK - BASE CLASSES
 * Inspired by obra/superpowers framework architecture
 */

import { AIProvider, AIMessage, AIResponse } from './ai-providers.ts';

export interface AgentSkill {
  name: string;
  description: string;
  priority: number; // 1-10, higher = more important
  execute: (context: AgentContext) => Promise<SkillResult>;
  shouldActivate: (context: AgentContext) => boolean;
}

export interface AgentContext {
  input: string;
  history: AIMessage[];
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface SkillResult {
  success: boolean;
  output: string;
  metadata?: Record<string, any>;
  nextSkills?: string[]; // Skills to activate next
}

export interface AgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  provider: AIProvider;
  skills?: AgentSkill[];
  autonomousMode?: boolean;
  maxIterations?: number;
}

/**
 * Base Agent Class - All specialized agents inherit from this
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected skills: Map<string, AgentSkill>;
  protected executionHistory: SkillResult[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.skills = new Map();

    // Register skills
    if (config.skills) {
      config.skills.forEach(skill => this.registerSkill(skill));
    }
  }

  /**
   * Register a new skill with the agent
   */
  registerSkill(skill: AgentSkill): void {
    this.skills.set(skill.name, skill);
  }

  /**
   * Get all registered skills
   */
  getSkills(): AgentSkill[] {
    return Array.from(this.skills.values()).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Main execution method - processes input and determines which skills to activate
   */
  async execute(context: AgentContext): Promise<AIResponse> {
    const activatedSkills: AgentSkill[] = [];

    // The "1% Rule" from superpowers: If there's any chance a skill is relevant, activate it
    for (const skill of this.getSkills()) {
      if (skill.shouldActivate(context)) {
        activatedSkills.push(skill);
      }
    }

    // Execute skills in priority order
    const skillResults: SkillResult[] = [];
    for (const skill of activatedSkills) {
      try {
        const result = await skill.execute(context);
        skillResults.push(result);
        this.executionHistory.push(result);

        // If skill suggests next skills, add them to activation queue
        if (result.nextSkills) {
          for (const nextSkillName of result.nextSkills) {
            const nextSkill = this.skills.get(nextSkillName);
            if (nextSkill && !activatedSkills.includes(nextSkill)) {
              activatedSkills.push(nextSkill);
            }
          }
        }
      } catch (error) {
        console.error(`Skill ${skill.name} failed:`, error);
      }
    }

    // Build messages for AI provider
    const messages: AIMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...context.history,
      { role: 'user', content: this.buildPromptWithSkillResults(context.input, skillResults) }
    ];

    // Generate response using AI provider
    const response = await this.config.provider.generateResponse(messages);

    return response;
  }

  /**
   * Streaming execution method
   */
  async executeStream(context: AgentContext, onChunk: (chunk: string) => void): Promise<AIResponse> {
    const activatedSkills: AgentSkill[] = [];

    for (const skill of this.getSkills()) {
      if (skill.shouldActivate(context)) {
        activatedSkills.push(skill);
      }
    }

    const skillResults: SkillResult[] = [];
    for (const skill of activatedSkills) {
      try {
        const result = await skill.execute(context);
        skillResults.push(result);
        this.executionHistory.push(result);
      } catch (error) {
        console.error(`Skill ${skill.name} failed:`, error);
      }
    }

    const messages: AIMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      ...context.history,
      { role: 'user', content: this.buildPromptWithSkillResults(context.input, skillResults) }
    ];

    const response = await this.config.provider.streamResponse(messages, onChunk);
    return response;
  }

  /**
   * Build prompt that includes skill execution results
   */
  protected buildPromptWithSkillResults(input: string, skillResults: SkillResult[]): string {
    if (skillResults.length === 0) {
      return input;
    }

    let prompt = `User Input: ${input}\n\n`;
    prompt += `Activated Skills Results:\n`;

    for (const result of skillResults) {
      prompt += `\n---\n${result.output}\n`;
    }

    prompt += `\n---\n\nBased on the above skill executions and user input, provide your expert response:`;

    return prompt;
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.executionHistory = [];
  }

  /**
   * Get execution history
   */
  getHistory(): SkillResult[] {
    return [...this.executionHistory];
  }

  /**
   * Abstract method for autonomous brainstorming
   */
  abstract brainstorm(problem: string): Promise<string[]>;

  /**
   * Abstract method for creating implementation plan
   */
  abstract createPlan(objective: string): Promise<string[]>;
}

/**
 * Autonomous Agent - Extends BaseAgent with autonomous capabilities
 */
export class AutonomousAgent extends BaseAgent {
  private maxIterations: number;

  constructor(config: AgentConfig) {
    super(config);
    this.maxIterations = config.maxIterations || 10;
  }

  /**
   * Autonomous execution loop - inspired by superpowers
   */
  async executeAutonomously(objective: string): Promise<AIResponse[]> {
    const responses: AIResponse[] = [];

    // Phase 1: Brainstorm
    const ideas = await this.brainstorm(objective);

    // Phase 2: Create Plan
    const plan = await this.createPlan(objective);

    // Phase 3: Execute plan iteratively
    let iteration = 0;
    let currentContext: AgentContext = {
      input: objective,
      history: [],
      metadata: { plan, ideas }
    };

    while (iteration < this.maxIterations) {
      const response = await this.execute(currentContext);
      responses.push(response);

      // Update context with response
      currentContext.history.push({ role: 'assistant', content: response.content });

      // Check if objective is complete
      if (this.isObjectiveComplete(response, objective)) {
        break;
      }

      iteration++;
    }

    return responses;
  }

  /**
   * Brainstorm solutions for a problem
   */
  async brainstorm(problem: string): Promise<string[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `${this.config.systemPrompt}\n\nYou are in BRAINSTORMING mode. Generate creative, diverse ideas to solve the problem.`
      },
      {
        role: 'user',
        content: `Brainstorm 5 different approaches to solve this problem:\n${problem}`
      }
    ];

    const response = await this.config.provider.generateResponse(messages);

    // Parse ideas from response (simple line-based parsing)
    return response.content
      .split('\n')
      .filter(line => line.match(/^\d+\.|^-|^•/))
      .map(line => line.replace(/^\d+\.|^-|^•/, '').trim());
  }

  /**
   * Create implementation plan
   */
  async createPlan(objective: string): Promise<string[]> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: `${this.config.systemPrompt}\n\nYou are in PLANNING mode. Break down the objective into clear, actionable steps.`
      },
      {
        role: 'user',
        content: `Create a detailed step-by-step plan to achieve:\n${objective}`
      }
    ];

    const response = await this.config.provider.generateResponse(messages);

    return response.content
      .split('\n')
      .filter(line => line.match(/^\d+\.|^-|^•|^Step/i))
      .map(line => line.replace(/^\d+\.|^-|^•|^Step \d+:/i, '').trim());
  }

  /**
   * Determine if objective is complete
   */
  protected isObjectiveComplete(response: AIResponse, objective: string): boolean {
    const completionKeywords = ['complete', 'finished', 'done', 'accomplished', 'achieved'];
    const content = response.content.toLowerCase();

    return completionKeywords.some(keyword => content.includes(keyword));
  }
}
