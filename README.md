# Task Management Dashboard Frontend

## Objective

A task management dashboard application using HTML, TailwindCSS, and jQuery.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This project is the frontend of a task management dashboard application, designed to be responsive and interactive using TailwindCSS for styling and jQuery for dynamic functionality.

## Features

- Responsive UI using TailwindCSS
- Dynamic task loading using jQuery AJAX
- Task search, filtering, and sorting
- Task management (add, edit, delete) with modal dialogs
- Drag-and-drop functionality for task status changes

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have a working computer with an internet connection.
- You have installed [Node.js](https://nodejs.org/en/download/) (which includes npm).
- You have installed [Visual Studio Code](https://code.visualstudio.com/).

## Installation

Follow these steps to set up the project locally.

### 1. Clone the repository

2. Open your terminal and run this command to ensure it is installed
node -v
npm -v

3. Open the folder on vscode
4. Install the neccessary packages , by running this command on your CLI
-npm install
5. Add this build script to your package.json 
-"scripts": {
  "build:css": "npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/styles.css --watch"
}
6. run the build script
- npm run build:css
7. use this command to start the projct on watch mode
-npx tailwindcss -i ./src/styles/tailwind.css -o ./dist/styles.css --watch

