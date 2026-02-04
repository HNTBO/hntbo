---
title: "Folder Manager"
description: "Python utility for organizing project folders with consistent naming conventions and structure templates."
githubUrl: "https://github.com/HNTBO/folder-manager"
image: "/images/tools/folder-manager.jpg"
tags: ["Python", "Utility", "Organization"]
featured: false
isLive: false
---

## Overview

A command-line tool for creating and managing project folder structures. Designed for creative professionals who work across multiple projects and need consistent organization.

## Features

- **Template system**: Define reusable folder structures
- **Naming conventions**: Automatic date prefixes and slug generation
- **Batch operations**: Create multiple project folders at once
- **Cross-platform**: Works on Windows, macOS, and Linux

## Why This Exists

After years of manually creating project folders and inevitably ending up with inconsistent naming, I built this tool to automate the process. Every project now starts with the same organized structure.

## Installation

```bash
pip install hntbo-folder-manager
```

## Basic Usage

```bash
# Create a new project with the default template
folder-manager create "Client Name - Project Title"

# List available templates
folder-manager templates

# Create with a specific template
folder-manager create "Video Project" --template video
```
