# Zone In

Build an Interactive AI Study Coach App for My Brother

Build a polished, mobile-first study-planning web app called “StudyOS” based on the attached study planner.

This is NOT a generic to-do list.

It should feel like a combination of:

a personal study coach

a game

a timetable

a productivity tracker

an accountability system

a fun Gen-Alpha-friendly dashboard

The goal is to make following the study plan feel engaging while making it difficult to simply mark tasks complete without actually doing them.

1. IMPORTANT: USE MY EXISTING STUDY PLAN

Use the uploaded planner as the source of truth for the timetable.

Do not invent a completely different schedule.

The planner contains:

Weekday school-day schedule

Alternate-day schedule

Online-day schedule

Saturday schedule

Sunday schedule

Allen coaching/practice

SST, Science, Maths, English/Kannada

Exercise

Breaks/outdoor time

Dinner

Sleep

Weekly streak tracking

Non-negotiables

The existing schedule should become structured app data rather than static text.

2. CORE PRODUCT IDEA

The app should answer one question at all times:

“What should I be doing RIGHT NOW?”

The home screen should dynamically understand the current date and time.

For example:

If it is 6:32 PM and today's task is “Class Revision”, the app should prominently show:

⚡ RIGHT NOW
Class Revision
7:25 PM – 8:30 PM
53 min remaining

with a large START SESSION button.

If a scheduled task has started and the user hasn't started it, show:

🚨 YOU'RE OFF SCHEDULE
Maths started 8 minutes ago.

Give buttons:

START NOW
I HAVE A VALID REASON

Do not shame the user. Be firm but supportive.

3. VISUAL STYLE

The UI should feel modern, energetic and Gen Alpha-friendly without becoming childish.

Use the visual language of the uploaded planner:

bold cards

thick dark borders

rounded corners

colorful subject/day categories

playful micro-interactions

large typography

subtle shadows

emoji used strategically

progress bars

streaks

XP

badges

animated celebrations

clean white/light backgrounds

dark navy/black text

Use colors inspired by the planner:

Blue → School / weekday

Purple → Alternate day

Teal → Online day

Orange → Saturday

Red → Sunday / alerts

Green → completed / success

Avoid making the UI look like a corporate productivity app.

Think:

Duolingo × Notion Calendar × modern gaming dashboard × study coach

But do not copy any copyrighted UI directly.

4. MAIN DASHBOARD

Create a beautiful dashboard with:

Header

“HEY, AMIT 👋”

Below it:

Monday, 17 August

Then:

🔥 6 DAY STREAK

Show:

today's completion %

weekly completion %

XP

current streak

today's study time

tasks completed / total

Main “RIGHT NOW” CARD

This is the most important card on the screen.

Display:

current task

subject

start/end time

countdown

task description

progress

START SESSION button

Example:

⚡ RIGHT NOW

MATHEMATICS
9:00 – 10:00 PM

“Complete today's assigned Maths practice.”

[ START SESSION ]

Once started:

[ SESSION ACTIVE ]

Show a timer.

5. TODAY'S TIMELINE

Create a vertical timeline for the entire day.

Example:

06:00 Exercise ✓
06:30 SST Revision ✓
07:15 School
04:30 Schoolwork
06:00 Outdoor Break
06:45 Allen Practice
09:00 Maths ← CURRENT
10:00 Wrap Up
10:15 Sleep

Each task should visually change state:

Upcoming

Current

Completed

Missed

Skipped with reason

The current task should have a glowing/pulsing indicator.

6. AUTOMATIC DAY TYPE

Do NOT make the user manually choose “Weekday / Alternate / Online / Saturday / Sunday” every day.

Build a configurable weekly schedule engine.

The app should automatically determine today's schedule from the configured calendar.

Allow the parent/user to edit the mapping later.

For example:

Wednesday and Thursday can be configured as Online Days.

Saturday and Sunday have their own schedules.

The schedule should automatically load each morning.

7. TASK SESSION SYSTEM

Every study task should have a real session.

When the user presses:

START SESSION

start a timer.

During a study session:

show task name

show remaining time

show progress

show motivational messages

allow pause only under controlled rules

track active time

track interruptions

track completion

At the end:

Show a short completion screen.

Example:

🔥 SESSION COMPLETE

Maths — 60 min

+100 XP

+1 streak progress

“Clean work. Next mission unlocked.”

8. ANTI-CHEAT / ACCOUNTABILITY SYSTEM

The app should discourage fake completion.

IMPORTANT:

Do NOT implement invasive surveillance, hidden recording, spying, or anything that secretly monitors the user.

Instead, use transparent accountability mechanics.

A task should NOT simply become completed because the user taps a checkbox.

Use a combination of:

A. Active session timer

The user must start a session.

B. Minimum active time

For example, a 60-minute Maths session should require a meaningful amount of active session time before completion.

Make this configurable.

C. Completion check

At the end of a study session ask a quick verification question.

Examples:

“Write one thing you learned.”

or

“Which topic did you work on?”

or

“Rate your understanding: 1–5.”

For selected academic tasks, optionally generate a tiny quiz from the task/topic.

D. Evidence / reflection

For important tasks allow:

short text reflection

upload photo of handwritten work

upload completed worksheet

Do not require this for every task.

E. Missed-task handling

If a task ends without completion:

mark it as:

⚠️ MISSED

Then ask:

“What happened?”

Options:

School ran late

Coaching ran late

I wasn't feeling well

Family reason

I got distracted

Other

Never punish legitimate reasons.

9. DISTRACTION PROTECTION

Create a FOCUS MODE.

When Focus Mode begins:

Show a fullscreen minimal interface:

🎯 FOCUS MODE

MATHEMATICS
9:00–10:00

[ Timer ]

“Stay locked in.”

Include an optional distraction counter.

If the browser/tab becomes inactive, record an interruption event.

Example:

⚠️ Focus interrupted

“Your study session was inactive for 3 minutes.”

Do NOT secretly monitor other apps or devices.

Do NOT claim to be able to block apps unless an actual device-level integration exists.

Instead, provide honest browser-level focus features.

10. SMART BREAKS

The planner specifically says breaks should be gadget-free.

Create a break mode.

Example:

🌿 RESET BREAK

6:00–6:30

“Go outside. No gadgets.”

Show a countdown and fun suggestions:

Walk

Stretch

Talk to someone

Get some fresh air

Volleyball

Water break

Do not allow the break timer to be casually converted into study time.

11. GAMIFICATION

Make studying feel like a game.

Add:

XP

Every completed task gives XP.

Example:

Exercise → +20 XP
Revision → +50 XP
Allen Practice → +100 XP
Full study session → +100 XP

Levels

Example:

Level 1 — Rookie
Level 2 — Getting Serious
Level 3 — Locked In
Level 4 — Consistency Beast
Level 5 — Board Boss

Keep names fun but not cringe.

Streak

Display:

🔥 7 DAYS

If a day is completed successfully, increase streak.

If a day is missed, don't use manipulative language.

Instead:

“Streak paused. Tomorrow is a fresh start.”

Badges

Examples:

🔥 3-Day Streak
🔥 7-Day Streak
🎯 10 Perfect Sessions
📚 100 Study Hours
⚡ Early Bird
🧠 Revision Machine
🏆 Weekly Finisher

12. DAILY SCORE

Create a daily score out of 100.

Example:

Today's Score

████████████░ 86%

Breakdown:

Study sessions: 40/40
Timetable adherence: 25/30
Revision: 15/15
Focus: 6/10
Sleep target: 0/5

Make the scoring system configurable.

Do NOT encourage unhealthy overworking.

Consistency matters more than studying endlessly.

13. WEEKLY REVIEW

Create a weekly analytics page.

Show:

total study time

planned study time

completed sessions

missed sessions

timetable adherence

strongest subject

subject needing attention

average focus duration

streak

XP earned

Use clean charts.

Example:

THIS WEEK

📚 18h 40m studied
🎯 87% schedule adherence
🔥 6 day streak
⚡ 1,240 XP

Then:

“Your strongest area this week: Science”

“Maths needs more consistency.”

Keep insights constructive.

14. SUBJECT DASHBOARD

Create a Subjects page.

Subjects:

Maths

Physics

Chemistry

Biology

Science

SST

English

Kannada

Each subject gets:

total study time

completed sessions

pending work

recent performance

revision status

progress

15. TEST / EXAM MODE

Create a Tests page.

Allow adding:

test name

subject

date

syllabus

priority

Then automatically show:

“SCIENCE TEST IN 4 DAYS”

Create suggested revision tasks based on the existing schedule.

Do not completely rewrite the timetable.

Fit revision into available study slots.

16. AI STUDY COACH

Create an AI Coach screen.

The coach should behave like a smart, supportive accountability partner.

Examples:

User:
“I don't feel like studying Maths.”

Coach:

“Fair. Let's make it tiny. Start with 10 minutes of the easiest questions. Once you're moving, we'll reassess.”

User:
“I missed my 6:30 session.”

Coach:

“No panic. You missed one block, not the whole day. Your next scheduled task starts at 4:30. Let's protect that one.”

User:
“I finished everything today.”

Coach:

“Clean sweep 🔥. You followed the plan instead of chasing motivation. That's the win.”

The coach should never insult, threaten, guilt-trip, or shame the student.

17. PARENT / GUARDIAN VIEW

Create an optional separate parent dashboard.

It should show high-level accountability:

today's completion

weekly adherence

missed sessions

study time

upcoming tests

streak

notes

Do NOT expose unnecessary private conversations with the AI coach.

The parent dashboard should focus on academic progress and schedule adherence.

18. NOTIFICATIONS

Create configurable reminders.

Examples:

10 minutes before:

⏰ Maths starts in 10 min.

At start:

🚀 Maths mission is live.

If late:

⚠️ You're 7 minutes behind schedule.

After completion:

🔥 Maths complete. +100 XP.

Before bedtime:

🌙 Wrap-up time. Tomorrow starts with a clean slate.

Do not spam notifications.

19. SLEEP PROTECTION

The planner includes a sleep target.

The system should recognize sleep as a priority.

Do NOT encourage the student to sacrifice sleep to complete missed work.

If a task is missed late at night:

suggest moving it to the next appropriate study slot rather than extending the night indefinitely.

20. SETTINGS

Create settings for:

student name

weekly schedule

subjects

XP values

streak rules

session rules

notification preferences

test dates

parent/guardian access

theme

sound effects

focus mode

21. DATABASE

Use a proper backend/database rather than storing everything only in browser localStorage.

Create sensible tables/entities for:

Users
Schedules
ScheduleTasks
StudySessions
Subjects
Tests
Achievements
XPTransactions
DailyProgress
WeeklyProgress
FocusEvents
Reflections
Notifications

Include timestamps and relationships.

22. IMPORTANT PRODUCT RULE

The app must never pretend it can verify something it cannot actually verify.

For example:

Do NOT say:

“We know you studied because you were sitting at your desk.”

Instead say:

“Your study session was active for 47 minutes.”

Be transparent about what the system measures.

23. MOBILE-FIRST DESIGN

The primary experience should be mobile.

Bottom navigation:

🏠 Home
📅 Plan
📚 Subjects
🔥 Progress
🤖 Coach

Make the main actions reachable with one hand.

Desktop should also work beautifully.

24. MICRO-INTERACTIONS

Use subtle animations:

XP number increases

progress bars animate

completed task gets a satisfying check animation

streak flame animates

level-up celebration

confetti after major milestones

countdown transitions

cards slightly lift on interaction

Keep animations fast and polished.

Add sound effects only if the user enables them.

25. FIRST-TIME EXPERIENCE

On first launch:

Welcome screen:

“Ready to lock in? 🔥”

Ask:

Name

Confirm weekly schedule

Confirm subjects

Set notification preferences

Set parent/guardian access if desired

Then:

“Your first mission is ready.”

Show today's first task.

26. HOME SCREEN PRIORITY

The home screen should NOT be overloaded.

Hierarchy:

Current task

Today's progress

Timeline

Streak / XP

Upcoming task

Coach suggestion

The user should understand what to do next within 2 seconds.

27. RESPONSIVE UI

Make every component responsive.

Mobile:

bottom navigation

stacked cards

large buttons

compact timeline

Tablet:

two-column dashboard

Desktop:

sidebar

dashboard grid

timeline + analytics

28. DATA ACCURACY

Preserve the actual timetable from my uploaded planner.

For example:

Weekday:
6:00–6:30 Exercise
6:30–7:15 Revision
4:30–6:00 Schoolwork/project
6:00–6:30 Outdoor break
6:45–8:30 Allen Practice
9:00–11:00 SST or English/Kannada

Alternate Day:
6:00–6:30 Exercise
6:30–7:15 SST/tutorial
4:30–6:00 Schoolwork
6:00–6:30 Outdoor
6:45–8:30 Allen Practice
9:00–10:00 Science
10:00–11:00 Maths

Online Days:
5:15–6:15 Walk/outdoor
6:15–7:15 Online class
7:25–8:30 Class revision
8:30–9:00 Dinner
9:00–10:00 English/SST

Saturday:
Follow the detailed Saturday schedule from the planner.

Sunday:
Follow the detailed Sunday schedule from the planner.

Keep these schedules editable.

29. NON-NEGOTIABLES

Represent these clearly in the app:

🔥 Exercise consistently
📵 Gadget-free outdoor breaks
📚 Same-day Allen practice
🌙 Sleep on time
🎯 Follow the scheduled session

But make the system supportive rather than authoritarian.

30. BUILD QUALITY

Build this as a REAL functioning app, not a static mockup.

The buttons should work.

Timers should work.

Progress should persist.

The dashboard should update automatically.

Tasks should change state.

XP should update.

Streaks should update.

Charts should use real stored data.

The timetable should respond to the current time/date.

Use reusable components and clean architecture.

Use a modern frontend stack supported by Lovable.

Use a proper backend/database and authentication if required.

Seed the database with the study schedule from the uploaded planner so the app is immediately usable.

31. FINAL DESIGN FEEL

The emotional feeling should be:

“I actually want to open this app.”

Not:

“My parents made me use this.”

It should feel like the student's personal command center.

Fun. Fast. Colorful. Competitive with yourself. Motivating. Clean.

The core philosophy:

Not extreme. Just consistent.

One mission at a time.

Show up. Lock in. Level up.

Start by building the complete functional MVP with the dashboard, automatic timetable, live study sessions, focus mode, XP/streak system, weekly progress, AI coach, and backend persistence.

After implementing the MVP, make the UI polished and production-quality rather than leaving placeholder components.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://amitsstudybuddy.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/acb70b89-4132-4296-a4f0-90386aadee30).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
