# 🎯 Skill_Guide — One-Stop Personalized Career & Education Advisor

> **An intelligent, personalized career and education guidance platform that helps students and learners discover suitable career paths, identify skill gaps, build personalized roadmaps, and track their progress.**

---

## 🏆 Smart India Hackathon

**Problem Statement:** One-Stop Personalized Career & Education Advisor
**PS ID:** SIH25094
**Theme:** Education & Skill Development
**Institution:** Thakur College of Engineering and Technology, Kandivali, Mumbai

The project is being developed as a Smart India Hackathon solution based on the provided problem statement document.

---

# 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem](#-problem)
* [Our Solution](#-our-solution)
* [How It Works](#-how-it-works)
* [Key Features](#-key-features)
* [Target Users](#-target-users)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Getting Started](#-getting-started)
* [Environment Variables](#-environment-variables)
* [Development Workflow](#-development-workflow)
* [Documentation](#-documentation)
* [Roadmap](#-roadmap)
* [Team](#-team)
* [Contributing](#-contributing)

---

# 🚀 About the Project

**Skill_Guide** is a personalized career and education advisor designed for:

* High school students
* College students
* Job seekers
* Learners exploring new career paths

Instead of providing generic career advice, Skill_Guide analyzes a user's:

* Education
* Skills
* Interests
* Goals
* Assessment results
* Projects
* Experience
* Career preferences

and uses this information to generate personalized career recommendations and learning roadmaps.

The platform is designed around a continuous career-development loop:

```text
Understand User
      ↓
Recommend Careers
      ↓
Identify Skill Gaps
      ↓
Create Personalized Roadmap
      ↓
Learn & Build
      ↓
Track Progress
      ↓
Reassess
      ↓
Improve Recommendations
```

---

# ❓ Problem

Students and learners often face difficulty answering questions such as:

> "Which career is right for me?"

> "What skills do I need?"

> "What am I missing?"

> "Which course should I take?"

> "What should I build?"

> "Am I ready for an internship?"

> "What happens if I learn another skill?"

Career information is often distributed across multiple platforms, making it difficult for users to create a clear and personalized path.

Skill_Guide brings these capabilities together into a single platform.

---

# 💡 Our Solution

Skill_Guide creates a **personalized career profile** for each user.

The platform then analyzes that profile against career requirements and generates:

### 🎯 Career Recommendations

Multiple career paths ranked according to the user's profile.

### 🧩 Skill Gap Analysis

Shows which skills the user already has and which skills they need to develop.

### 🗺️ Personalized Roadmap

Creates an actionable sequence of learning activities, projects, certifications, and preparation tasks.

### 🔮 What-If Career Simulator

Allows users to experiment with hypothetical skills and see how their career recommendations may change.

### 📄 Resume Analysis

Analyzes a user's resume and identifies relevant skills, experience, projects, and potential gaps.

### 🐙 GitHub Profile Analysis

Analyzes publicly available GitHub information to understand the user's technical profile and project activity.

### 🎓 Course Recommendations

Suggests learning resources according to career goals and skill gaps.

### 💼 Internship Recommendations

Helps users discover internship opportunities relevant to their profile.

### 🤖 AI Career Assistant

Provides conversational career guidance using the user's career context.

---

# 🔄 How It Works

## 1. Create an Account

The user signs up and logs into the platform.

```text
Sign Up
   ↓
Login
```

---

## 2. Select Education Level

The user selects their current stage:

```text
High School
College Student
Job Seeker
```

The onboarding process adapts according to the selected category.

---

## 3. Build Your Career Profile

The user provides information such as:

* Education
* Academic performance
* Skills
* Interests
* Projects
* Experience
* Certifications
* Career preferences
* Goals

---

## 4. Complete Assessment

The system collects additional information related to:

* Interests
* Aptitude
* Work preferences
* Career preferences
* Technical inclination
* Problem-solving
* Creativity

---

## 5. Get Career Recommendations

The recommendation engine analyzes the profile and generates multiple career matches.

Example:

```text
Full Stack Developer       87%
Software Engineer          82%
Backend Developer          76%
Data Analyst               64%
```

The scores represent **internal recommendation scores**, not guaranteed career outcomes.

---

## 6. Understand Your Skill Gaps

The system compares the user's current skills with the skills required for a selected career.

```text
JavaScript       █████████░  Strong
React            ████████░░  Strong
Node.js          ████░░░░░░  Developing
SQL              ███░░░░░░░  Developing
Docker           ██░░░░░░░░  Beginner
```

---

## 7. Generate a Roadmap

The system generates an ordered learning and development roadmap.

Example:

```text
Phase 1
JavaScript Advanced Concepts
       ↓
Phase 2
Node.js + Express
       ↓
Phase 3
SQL + Database Design
       ↓
Phase 4
REST APIs
       ↓
Phase 5
Full-Stack Project
       ↓
Phase 6
Resume + Interview Preparation
```

---

## 8. Track Progress

Users can:

* Start tasks
* Complete tasks
* Pause tasks
* Modify tasks
* Reorder tasks
* Add custom tasks

Their progress is reflected on the dashboard.

---

# ✨ Key Features

| Feature                       | Description                          |
| ----------------------------- | ------------------------------------ |
| 🎯 Career Recommendations     | Personalized career suggestions      |
| 🧩 Skill Gap Analysis         | Identifies missing skills            |
| 🗺️ Personalized Roadmap      | Creates an actionable career path    |
| 🔮 What-If Simulator          | Simulates changes in skills          |
| 📊 Career Comparison          | Compare different career paths       |
| 📄 Resume Analysis            | Analyze resume alignment             |
| 🐙 GitHub Analysis            | Analyze public GitHub profile        |
| 🎓 Course Recommendations     | Discover relevant learning resources |
| 💼 Internship Recommendations | Discover relevant internships        |
| 🤖 AI Career Assistant        | Conversational career guidance       |
| 🔔 Personalized Notifications | Progress and recommendation updates  |
| 📈 Progress Tracking          | Track roadmap completion             |
| 🧭 Career Explorer            | Explore different career paths       |

---

# 👥 Target Users

## 🎒 High School Students

For students beginning to explore possible career directions.

---

## 🎓 College Students

For students developing skills, building projects, and preparing for internships and employment.

---

## 💼 Job Seekers

For graduates and professionals exploring employment opportunities or career transitions.

---

# 🧠 Intelligent Recommendation System

Skill_Guide uses a **hybrid recommendation architecture** rather than relying entirely on a machine-learning model.

```text
                User Profile
                     ↓
              Data Processing
                     ↓
          ┌──────────┼──────────┐
          ↓          ↓          ↓
      Rule-Based   Skill      Optional
       Matching   Matching       ML
          │          │          │
          └──────────┼──────────┘
                     ↓
             Career Ranking
                     ↓
              Skill Gap Analysis
                     ↓
             Roadmap Generation
```

This approach allows the MVP to work reliably even without a large machine-learning dataset.

---

# 🛠️ Technology Stack

## Frontend

* React
* JavaScript
* Tailwind CSS
* React Router
* Axios / Fetch

## Backend

* Node.js
* Express.js
* REST API

## Database

* MySQL

## AI / ML

* Python
* FastAPI
* Pandas
* NumPy
* Scikit-learn
* Optional LLM integration

## Development

* Git
* GitHub

---

# 🏗️ System Architecture

```text
                         USER
                           │
                           ↓
                ┌────────────────────┐
                │   React Frontend   │
                │   Tailwind CSS     │
                └─────────┬──────────┘
                          │
                         HTTPS
                          │
                          ↓
                ┌────────────────────┐
                │   Node.js Backend  │
                │      Express       │
                └───────┬───────┬────┘
                        │       │
                 ┌──────┘       └───────┐
                 ↓                      ↓
          ┌──────────────┐       ┌──────────────┐
          │    MySQL     │       │ Python AI    │
          │   Database   │       │   FastAPI    │
          └──────────────┘       └──────┬───────┘
                                        │
                              ┌─────────┼─────────┐
                              ↓         ↓         ↓
                           Rules    Matching     ML
                           Engine    Engine     Model
```

For the complete architecture, database design, ER diagram, API architecture, AI architecture, and data flows:

📖 **See [`docs/main_architecture.md`](docs/main_architecture.md)**

---

# 📂 Project Structure

```text
career-advisor/
│
├── client/                     # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                     # Node.js + Express backend
│   ├── src/
│   └── package.json
│
├── ai-service/                 # Python AI/ML service
│   ├── app/
│   ├── models/
│   ├── data/
│   └── requirements.txt
│
├── database/                   # MySQL schema and seed data
│   ├── schema.sql
│   └── seed.sql
│
├── docs/
│   ├── PRD.md
│   ├── main_architecture.md
│   └── rules.md
│
├── .gitignore
├── README.md
└── docker-compose.yml
```

---

# ⚙️ Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.x
* MySQL
* Git

---

# 1. Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd career-advisor
```

---

# 2. Setup Frontend

```bash
cd client
npm install
npm run dev
```

---

# 3. Setup Backend

Open another terminal:

```bash
cd server
npm install
npm run dev
```

---

# 4. Setup AI Service

Open another terminal:

```bash
cd ai-service

python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the service:

```bash
uvicorn app.main:app --reload
```

---

# 5. Setup MySQL

Create the database:

```sql
CREATE DATABASE career_advisor;
```

Then execute:

```bash
database/schema.sql
```

and:

```bash
database/seed.sql
```

---

# 🔐 Environment Variables

Create `.env` files based on `.env.example`.

## Backend

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=career_advisor

JWT_SECRET=

AI_SERVICE_URL=http://localhost:8000
```

## AI Service

```env
PORT=8000

LLM_API_KEY=
```

> Never commit real secrets to GitHub.

---

# 🌱 Development Workflow

We use feature branches.

```text
main
 │
 ├── feature/authentication
 ├── feature/dashboard
 ├── feature/career-recommendation
 ├── feature/roadmap
 └── feature/resume-analysis
```

Basic workflow:

```bash
git checkout -b feature/<feature-name>

git add .

git commit -m "feat: add <feature>"

git push origin feature/<feature-name>
```

Then create a Pull Request.

The `main` branch should remain stable.

For complete development rules:

📖 **See [`docs/rules.md`](docs/rules.md)**

---

# 🗺️ Development Roadmap

## Phase 1 — Foundation

* [ ] Repository setup
* [ ] Frontend setup
* [ ] Backend setup
* [ ] MySQL setup
* [ ] Authentication
* [ ] Basic UI system

---

## Phase 2 — User Profile

* [ ] Education-level selection
* [ ] Profile onboarding
* [ ] Skills
* [ ] Interests
* [ ] Career preferences
* [ ] Assessment

---

## Phase 3 — Core Intelligence

* [ ] Career dataset
* [ ] Skill dataset
* [ ] Career-skill mapping
* [ ] Recommendation engine
* [ ] Skill-gap analysis
* [ ] Recommendation explanations

---

## Phase 4 — Roadmap

* [ ] Roadmap generator
* [ ] Roadmap tasks
* [ ] Progress tracking
* [ ] Task modification
* [ ] Dashboard

---

## Phase 5 — Differentiating Features

* [ ] What-If simulator
* [ ] Career comparison
* [ ] Career explorer
* [ ] Resume analysis
* [ ] Course recommendations

---

## Phase 6 — Advanced Features

* [ ] GitHub analysis
* [ ] Internship recommendations
* [ ] AI career assistant
* [ ] Personalized notifications
* [ ] Advanced ML recommendation

---

# 📚 Documentation

| Document                                            | Purpose                                         |
| --------------------------------------------------- | ----------------------------------------------- |
| [`PRD.md`](docs/PRD.md)                             | Product requirements and feature specifications |
| [`main_architecture.md`](docs/main_architecture.md) | Complete system and database architecture       |
| [`rules.md`](docs/rules.md)                         | Development and team rules                      |

Future documentation:

```text
docs/
├── PRD.md
├── main_architecture.md
├── rules.md
├── API.md
├── DATABASE.md
├── AI.md
├── SETUP.md
└── CONTRIBUTING.md
```

---

# 🔒 Security

Skill_Guide handles personal user information.

The application follows these principles:

* Passwords are hashed.
* Authentication is required for private resources.
* Users can only access their own private data.
* API inputs are validated.
* Secrets are stored in environment variables.
* Resume files are handled securely.
* Private GitHub data is never accessed without authorization.
* External API failures are handled gracefully.

---

# ⚠️ Important Disclaimer

Skill_Guide provides **personalized guidance and recommendations**.

Career recommendations are not guarantees of:

* Employment
* Salary
* Admission
* Academic success
* Career success

Recommendation scores are internal platform metrics intended to help users understand their current alignment with different career paths.

Users should use the platform as a decision-support tool and consider additional factors when making important education and career decisions.

---

# 🎯 Project Goal

Skill_Guide aims to move career guidance from:

```text
"What career should I choose?"
```

to:

```text
"Here are the careers that currently match your profile,
here is why,
here are your skill gaps,
and here is exactly what you can work on next."
```

---

# 👨‍💻 Team

**Institution:**
Thakur College of Engineering and Technology, Kandivali, Mumbai

**Team:**
Smart India Hackathon Team

| Member      | Responsibility                   |
| ----------- | -------------------------------- |
| Team Leader | Product + Frontend + Integration |
| Member 2    | Frontend + Backend               |
| Member 3    | Backend                          |
| Member 4    | AI/ML + Data                     |
| Member 5    | Backend + Database               |
| Member 6    | Testing + Research + Integration |

> Team member names and exact responsibilities should be updated once finalized.

---

# 🤝 Contributing

Before contributing:

1. Read [`docs/rules.md`](docs/rules.md)
2. Check existing issues/tasks.
3. Create a feature branch.
4. Implement the feature.
5. Test it locally.
6. Commit using the project commit convention.
7. Create a Pull Request.
8. Request review.
9. Fix review comments.
10. Merge only after approval.

---

# ⭐ Project Principle

> **Build one coherent product, not six separate mini-projects.**

Every feature should strengthen the central product loop:

```text
UNDERSTAND USER
      ↓
RECOMMEND CAREER
      ↓
IDENTIFY GAPS
      ↓
CREATE ROADMAP
      ↓
LEARN & BUILD
      ↓
TRACK PROGRESS
      ↓
UPDATE RECOMMENDATIONS
```

---

## 🚀 Skill_Guide

**Understand yourself. Discover possibilities. Build your path.**
