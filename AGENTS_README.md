# PhysioCore Superpowers Agent System

## 🤖 Overview

PhysioCore AI now integrates an advanced autonomous agent system inspired by the [obra/superpowers](https://github.com/obra/superpowers) framework. This system brings disciplined, process-driven AI agents to physiotherapy and rehabilitation, supporting multiple AI models and platforms.

## 🎯 Key Features

### Multi-Model AI Support
- **OpenAI GPT**: GPT-4o and other OpenAI models
- **Anthropic Claude**: Claude 3.5 Sonnet and other Claude models
- **Google Gemini**: Gemini 3 Flash Preview and other Gemini models
- Unified API for seamless model switching

### Specialized Expert Agents

#### 1. 🏥 Physiotherapist Expert Agent
- **Expertise**: Senior Clinical Physiotherapist with 20+ years experience
- **Core Competencies**:
  - Musculoskeletal assessment and diagnosis (ICF framework)
  - Evidence-based treatment planning (GRADE methodology)
  - Manual therapy techniques (Maitland, Mulligan, McKenzie)
  - Pain neuroscience education
  - Progressive rehabilitation protocols
- **Skills**:
  - Clinical assessment
  - Treatment planning
  - Exercise prescription
  - Pain management
  - Manual therapy
  - Red flag screening

#### 2. 💪 Exercise Specialist Agent
- **Expertise**: Exercise Science and Biomechanics Expert
- **Core Competencies**:
  - Exercise physiology and biomechanics
  - Movement analysis and correction
  - Strength and conditioning protocols
  - Functional movement screening
  - Periodization and progressive overload
- **Skills**:
  - Movement analysis
  - Exercise selection
  - Dosage calculation
  - Progression planning
  - Biomechanical optimization
  - Exercise modification

#### 3. ⚽ Sports Injury Specialist Agent
- **Expertise**: Sports Medicine and Rehabilitation
- **Core Competencies**:
  - Acute injury assessment (PEACE & LOVE protocol)
  - Sports-specific injury patterns
  - Return-to-sport decision making
  - Injury prevention strategies
  - Concussion management
- **Skills**:
  - Acute injury management
  - Tissue healing timeline
  - Return-to-sport assessment
  - Injury prevention
  - Concussion management
  - Performance testing

#### 4. ✋ Massage Therapist Agent
- **Expertise**: Registered Massage Therapist
- **Core Competencies**:
  - Therapeutic massage techniques
  - Soft tissue mobilization
  - Trigger point therapy
  - Myofascial release
  - Manual lymphatic drainage
- **Skills**:
  - Tissue assessment
  - Technique selection
  - Treatment application
  - Trigger point therapy
  - Contraindication screening
  - Self-care education

#### 5. 💻 Software Coder Agent
- **Expertise**: Senior Full-Stack Developer
- **Core Competencies**:
  - React, TypeScript, Tailwind CSS
  - Clean Code principles
  - Performance optimization
  - Security best practices
- **Skills**:
  - Code analysis
  - Design planning
  - Implementation
  - Testing
  - Debugging
  - Performance optimization
  - Code refactoring

#### 6. 🎓 Special Education Teacher Agent
- **Expertise**: Adaptive Physical Education
- **Core Competencies**:
  - Individualized Education Plans (IEP)
  - Adaptive physical education
  - Sensory integration
  - Behavioral support strategies
  - Universal Design for Learning (UDL)
- **Skills**:
  - Individual assessment
  - IEP development
  - Adaptive instruction
  - Sensory integration
  - Behavior support
  - Family collaboration
  - Adaptive equipment

## 🚀 Architecture

### Agent Framework Components

```
agents/
├── core/
│   ├── ai-providers.ts      # Multi-model AI abstraction
│   ├── agent-base.ts         # Base agent classes and skills
│   └── orchestrator.ts       # Autonomous agent orchestration
├── specialists/
│   ├── physiotherapist-agent.ts
│   ├── exercise-specialist-agent.ts
│   ├── sports-injury-agent.ts
│   ├── massage-therapist-agent.ts
│   ├── software-coder-agent.ts
│   └── special-education-agent.ts
└── index.ts                  # Main exports
```

### Skill-Based Execution

Each agent has modular **skills** that activate based on context:
- Skills are prioritized (1-10 scale)
- Skills activate using the "1% Rule" - if there's any chance a skill is relevant, it activates
- Skills can chain together (one skill can trigger another)
- Skills return structured results with metadata

### Autonomous Activation

The orchestrator automatically:
1. **Analyzes user input** using keyword matching and context
2. **Selects relevant agents** (supports multiple agents in parallel)
3. **Executes agents** with appropriate skills
4. **Returns responses** with agent attribution

## 📚 Usage Examples

### Basic Usage

```typescript
import { queryWithAgents, initializeAgentSystem } from './ai-agent-service.ts';

// Initialize the system
initializeAgentSystem({
  defaultProvider: 'gemini',
  apiKeys: {
    gemini: 'your-api-key'
  }
});

// Query with automatic agent selection
const responses = await queryWithAgents(
  "Hastamın lomber ağrısı var, ne yapmalıyım?"
);

// Responses include agent type and content
responses.forEach(response => {
  console.log(`${response.agentType}: ${response.response.content}`);
});
```

### Specific Agent Query

```typescript
import { queryWithSpecificAgent } from './ai-agent-service.ts';

const response = await queryWithSpecificAgent(
  "Create a progressive loading protocol for ACL rehabilitation",
  'sports_injury'
);
```

### Streaming Response

```typescript
import { streamAgentResponse } from './ai-agent-service.ts';

await streamAgentResponse(
  "Design a 12-week strength program",
  'exercise_specialist',
  (chunk) => {
    console.log(chunk); // Real-time response streaming
  }
);
```

## 🎨 UI Integration

The **Agent Interface** component provides a chat-like interface:
- Automatic agent selection mode
- Manual agent selection
- Message history
- Streaming responses
- Mobile-responsive design

Access via the "AJANLAR" tab in the main navigation.

## 🔧 Configuration

### Multi-Model Support

```typescript
import { initializeAgentSystem } from './ai-agent-service.ts';

initializeAgentSystem({
  defaultProvider: 'claude', // or 'openai', 'gemini'
  apiKeys: {
    openai: 'sk-...',
    claude: 'sk-ant-...',
    gemini: 'AI...'
  },
  autoSelectAgents: true,
  maxConcurrentAgents: 3
});
```

### Custom Provider

```typescript
import { createAIProvider } from './agents/index.ts';

const provider = createAIProvider({
  provider: 'openai',
  apiKey: 'your-key',
  model: 'gpt-4o',
  temperature: 0.7
});
```

## 🧪 Workflow Principles (from superpowers)

### 1. Brainstorming
Agents generate multiple approaches before implementation

### 2. Planning
Break down objectives into actionable steps

### 3. Skill Activation
The "1% Rule" - activate skills if there's any chance they're relevant

### 4. Autonomous Execution
Agents work iteratively until objectives are complete

### 5. Disciplined Process
- Always assess before treating
- Screen for contraindications
- Provide evidence-based rationale
- Document decisions and outcomes

## 🌍 Cross-Platform Support

The agent system is designed to work across:
- Web browsers (current implementation)
- IDE tools and editors
- Mobile applications
- Desktop applications
- API endpoints

## 🔒 Security & Privacy

- API keys stored securely
- No data shared with third parties
- Local execution where possible
- Configurable privacy settings

## 📈 Future Enhancements

- [ ] Agent learning and improvement
- [ ] Custom agent creation
- [ ] Multi-agent collaboration
- [ ] Voice interface
- [ ] Integration with external medical databases
- [ ] Real-time patient monitoring agents
- [ ] Automated documentation agents

## 🤝 Contributing

To add a new agent:

1. Create a new file in `agents/specialists/`
2. Extend `AutonomousAgent` base class
3. Define agent skills
4. Register in orchestrator
5. Add to UI components

## 📝 License

This agent system is part of PhysioCore AI and follows the same licensing.

---

**Built with inspiration from [obra/superpowers](https://github.com/obra/superpowers) - bringing autonomous agent excellence to healthcare.**
