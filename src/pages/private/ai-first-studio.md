---
layout: ../../layouts/PrivateNoteLayout.astro
title: AI-First Studio
description: Strategic note on a possible AI-first production workflow for Morgane Productions.
kicker: Private / Strategy
updated: 2026-06-15
---

_Draft from the Discord conversation on 2026-06-14._

## 1. Context

Morgane Productions came into the TimeFrame / GPT Workbench orbit through Guillaume, who is the current contact at Morgane and has become a reference point for AI inside the company.

The current concrete trigger is a question from a senior Morgane executive, likely Sylvain Plantard, about whether it would be possible to reduce the cost of AI-generated footage for a show currently in development: _Secret Histoire_ with Stéphane Bern.

The immediate question is tactical:

> Can we reduce the AI footage bill for this specific production?

The more interesting answer may be strategic:

> Maybe not reliably on this exact production. But Morgane could help build the production pipeline that makes this kind of work cheaper, faster, more controlled, and more scalable in the future.

## 2. Core Thesis

Most existing studios are trying to add AI to already established production pipelines.

That may be the wrong starting point.

An AI-first studio should not be a traditional studio with AI tools added on top. It should be a production system designed from the ground up around generative workflows:

- client intent capture
- rapid visual exploration
- controlled iteration
- model orchestration
- prompt and asset traceability
- versioning
- approvals
- delivery
- reusable production memory

The goal is not to sell "AI art". The goal is to produce commercial audiovisual assets with a pipeline that is more adapted to how generative systems actually work.

## 3. What We Should Not Promise

The first mistake would be to pitch this as:

> We can make AI-generated footage cheaper.

That may be true in some cases, but generation prices are mostly fixed by model providers. The real leverage is not the unit cost of generation. The leverage is everything around it:

- fewer failed iterations
- fewer handoffs
- less time lost translating intent between client, production manager, artists, and tools
- better briefing
- better visual validation before video generation
- faster decision loops
- less copy-paste work across scattered SaaS interfaces
- automation of repetitive prompt, render, compare, and review steps

The cost reduction comes from process design, not from magic discounts on model inference.

## 4. Positioning

The AI-first studio should be positioned as:

> A new production interface between client intent and generative systems.

It is not:

- a cheap VFX vendor
- a prompt shop
- a fully automated content machine
- a replacement for all creative judgment

It is:

- a structured production environment
- a premium client experience
- a system for controlled generative iteration
- a way to reduce ambiguity and coordination overhead
- a reusable pipeline for future productions

## 5. The Client Experience: "The Nest"

The client-facing room could be called:

> The Nest

The Nest is the place where the client, the AI Producer, and the client-facing AI agent work together.

It should feel closer to a grading session than to a software demo:

- comfortable
- focused
- premium
- visual
- conversational
- designed for decision-making

The analogy with grading is useful: clients are used to entering a room where artistic and technical decisions are made in real time, with an expert guiding the session.

The Nest would apply that logic to AI-first production.

## 6. The Human Role: AI Producer

The key human role should be called:

> AI Producer

Earlier names such as "AI Bridger" or a maieutic role capture part of the idea, but "AI Producer" is easier to understand for an audiovisual client.

The AI Producer is not just a prompt operator.

They are responsible for translating client intent into a controlled generative production process:

- listening to the client
- extracting creative intent
- identifying constraints
- choosing tools and models
- setting up style references
- designing prompts and workflows
- reviewing outputs
- guiding iteration
- protecting consistency
- knowing when human intervention is needed
- maintaining the relationship between client expectation and production reality

The AI Producer is the human interface between the client and the system.

## 7. The Client-Facing Agent

The client should not be exposed to a confusing set of tools and model names.

They should interact with one AI persona:

> the agent

The agent is introduced early, during the first briefing sessions. It becomes part of the production environment.

Its role:

- listen to briefings
- preserve project memory
- summarize decisions
- detect contradictions
- help clarify intent
- remain available 24/7 for client context dumps
- support the AI Producer with structured memory
- make the production process more continuous between meetings

The client should feel that the agent is part of the studio's service, not a pile of disconnected chatbots.

## 8. Voice-First Workflow

The Nest should be voice-first.

Screens are obviously present, but the primary interaction is conversation:

- client explains intent
- AI Producer asks questions
- agent captures and structures the exchange
- visual directions are explored live
- decisions are recorded
- unresolved questions are tracked

This matters because written briefs often lose nuance. Voice captures hesitation, priority, tone, taste, fear, excitement, and contradiction.

The production value of the conversation is not only the transcript. It is the structured memory that can be extracted from it.

## 9. Ethical Framing

Client psychology matters. Production relationships are full of taste, anxiety, budget pressure, status, misunderstandings, and shifting expectations.

It is naive to pretend these factors do not exist.

But the pitch should not use language that suggests manipulation, profiling, or data harvesting.

The clean framing is:

> The system captures briefing history, preferences, approvals, objections, and creative decisions so the studio can reduce misunderstandings and preserve continuity across the project.

The ethical line:

- do not deceive the client
- do not extract more data than needed
- do not use hidden profiling against them
- do not optimize for manipulation over mutual clarity
- make the recording and memory layer explicit
- make it useful to the client, not only to the studio

This is not "psychological manipulation".

It is better account management with better instruments.

## 10. Data Retention and Training

The idea of retaining client interaction data for future training is sensitive and should not be central to the first pitch.

It may become relevant later, but only with:

- explicit disclosure
- clear consent
- clear retention policy
- a premium option if persistent memory is valuable
- strong separation between project memory and reusable training material

For the Morgane discussion, the safer framing is project continuity:

> We retain the project memory needed to make the production smoother, more consistent, and easier to resume.

Anything beyond that should be treated as a separate business, legal, and trust question.

## 11. API-First Production System

A serious AI-first studio should not rely on people copy-pasting prompts between various commercial interfaces.

That approach is slow, expensive, fragile, and hard to track.

The studio should be API-first:

- direct model calls when possible
- automated prompt variation
- batch generation
- structured metadata
- comparison tools
- review interfaces
- reusable prompt components
- logged decisions
- output ranking
- traceability from brief to final shot

The human should not be doing mechanical tool relay. The human should be making production decisions.

## 12. Production Flow

A possible first production flow:

1. First Nest session
   - Capture the client brief.
   - Identify the production need.
   - Define visual ambition, constraints, references, risks, and deliverables.

2. Project memory setup
   - Create a structured project brief.
   - Extract tone, style, references, constraints, and open questions.
   - Define what the agent should remember.

3. Visual territory exploration
   - Generate still-image territories.
   - Explore style, lighting, composition, historical tone, and level of realism.
   - Avoid video generation too early.

4. Style bible
   - Build a visual language for the production.
   - Define what belongs and what does not.
   - Capture references, approved outputs, rejected directions, and prompt logic.

5. Shot grammar
   - Define categories of shots.
   - Identify reusable shot types.
   - Decide which shots need AI video, which need stills, which need traditional methods, and which should not be attempted with AI.

6. Still validation
   - Validate key frames before spending generation budget on video.
   - Use still images as the cheapest and fastest decision surface.

7. Rolling video generation
   - Send approved stills or shot prompts to video generation.
   - While batch 1 renders, prepare batch 2.
   - While batch 2 renders, review batch 1.
   - Iterate in cycles instead of waiting passively.

8. Client review
   - Present curated options, not raw chaos.
   - Capture feedback through the agent and AI Producer.
   - Convert feedback into structured revisions.

9. Final delivery
   - Deliver final assets.
   - Archive prompts, versions, references, approvals, and decisions.
   - Preserve reusable project memory for future Morgane productions.

## 13. Why Morgane Is a Good Pilot

Morgane is a strong first partner because:

- they produce audiovisual content at real professional scale
- they have recurring production needs
- they have broadcaster relationships
- they already have an AI entry point through GPT Workbench
- Guillaume has become a trusted AI reference inside the company
- the current _Secret Histoire_ question gives a concrete entry point
- they could benefit from both tactical production support and strategic positioning

The pitch should not be:

> Let us sell you some AI shots.

It should be:

> Let us use this first case to design a new kind of production workflow with you.

## 14. Possible Morgane-Facing Pitch

> We may not be able to reliably reduce the generation cost of this specific episode just by negotiating or choosing another AI tool. The bigger opportunity is elsewhere.
>
> AI-generated footage becomes more efficient when the whole production pipeline is designed around it: briefing, visual exploration, validation, generation, review, versioning, and delivery.
>
> What we propose is to use this first case as the starting point for an AI-first production workflow. Morgane would not just be a client buying a few generated shots. You could help shape the workflow from the beginning, be the first to benefit from it, and potentially participate in the value created if this becomes a reusable production model.
>
> If this works, it is not just a cheaper way to generate footage. It is the beginning of a new production paradigm.

## 15. Tone for the Pitch

The tone should be:

- calm
- precise
- ambitious
- grounded in their concrete problem
- not too prophetic too early

Do not open with the biggest vision.

Start from the practical pain:

- AI footage is expensive
- iteration is messy
- tools are fragmented
- clients need control
- productions need predictability

Then reveal the larger opportunity:

> This is not only a cost problem. It is a production design problem.

## 16. Phrases to Use

- "AI-first production workflow"
- "shorter decision loops"
- "fewer handoffs"
- "controlled iteration"
- "project memory"
- "traceability from brief to final shot"
- "premium client experience"
- "voice-first briefing"
- "style bible"
- "visual territory exploration"
- "AI Producer"
- "reusable production model"

## 17. Phrases to Avoid

- "We will replace artists."
- "We can use fewer humans."
- "We analyze the client psychologically."
- "We harvest client data for future training."
- "Fully automated studio."
- "Just prompt it."
- "Cheaper AI footage guaranteed."

These may contain partial truths or internal strategic questions, but they are not the right client-facing language.

## 18. Ownership Question

The idea of Morgane partly owning the studio or workflow is powerful, but it needs careful framing.

Possible soft version:

> If Morgane wants to be involved early, we can discuss a structure where you do not only benefit as the first client, but also participate in the value created if the model becomes reusable beyond this first production.

This should not be improvised casually. It touches:

- equity
- IP
- exclusivity
- first-client advantage
- revenue share
- co-development
- future commercial use

For now, it should be framed as an opening:

> There may be a partnership structure to explore if the pilot proves valuable.

## 19. Open Questions

- What exactly is the _Secret Histoire_ AI footage need?
- Is the problem cost, quality, speed, volume, control, or uncertainty?
- What kind of shots are they imagining?
- Are these historical reconstructions, illustrative sequences, transitions, archival-style images, maps, textures, or full scenes?
- What level of rights clearance is required?
- What broadcaster constraints apply?
- Who validates the images?
- Who owns the outputs?
- What delivery format is expected?
- Is Morgane interested in being only a client, or in co-building a production capability?
- Would Guillaume and Gaël want this framed as an extension of GPT Workbench, a separate studio, or a joint venture?

## 20. Next Step

The next useful step is to turn this into two documents:

1. Internal strategy note for Fred, Guillaume, and Gaël
   - more direct
   - includes business model, ownership, risks, and internal assumptions

2. Morgane-facing pitch
   - calmer
   - concrete
   - built around their production problem
   - introduces the larger vision gradually

Before pitching Morgane, Fred should rehearse the structure:

1. Start with their problem.
2. Acknowledge the limitation of pure generation-cost reduction.
3. Shift to pipeline design.
4. Explain the AI-first studio concept.
5. Show what a pilot could look like.
6. Explain why Morgane is a good first partner.
7. Only then introduce the larger strategic upside.
