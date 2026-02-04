---
title: "Audio Visualizer"
description: "Real-time audio visualization tool with customizable bars and oscilloscope modes. Works with microphone input or browser tab audio."
githubUrl: "https://github.com/HNTBO/audio-visualizer"
image: "/images/tools/audio-visualizer.jpg"
tags: ["Audio", "Visualization", "Canvas"]
featured: true
isLive: true
livePath: "/tools/audio-visualizer/live"
---

## Overview

A browser-based audio visualizer built with vanilla JavaScript, Canvas 2D, and the Web Audio API. No dependencies, no build step required.

## Features

- **Two visualization modes**: Frequency bars and oscilloscope waveform
- **Multiple input sources**: Microphone or browser tab audio capture
- **Fully customizable**: Colors, glow effects, bar count, corner radius, and noise animation
- **Preset system**: Save and load your favorite configurations
- **High DPI support**: Crisp visuals on retina displays

## How It Works

The visualizer uses the Web Audio API to analyze audio input in real-time. Frequency data drives the bar heights, while time-domain data powers the oscilloscope view. All processing happens client-side in your browser.

## Requirements

- Modern browser (Chrome, Firefox, Edge, Safari)
- HTTPS connection for microphone access (localhost works for development)
- Microphone permission for mic input mode

## Use Cases

- Live streaming overlays
- Music production feedback
- Presentation backgrounds
- Creative coding experiments
