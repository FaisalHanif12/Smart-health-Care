# Smart Health & Fitness Tracker - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Goals](#project-goals)
3. [Target Market](#target-market)
4. [Use Cases](#use-cases)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [System Architecture](#system-architecture)
8. [Database Schema](#database-schema)
9. [API Documentation](#api-documentation)
10. [Technology Stack](#technology-stack)
11. [Deployment Architecture](#deployment-architecture)

---

## 1. Project Overview

### 1.1 Project Name
**Smart Health & Fitness Tracker**

### 1.2 Project Description
Smart Health & Fitness Tracker is a comprehensive, AI-powered web application designed to provide personalized fitness and nutrition guidance to users. Built using the MERN (MongoDB, Express.js, React, Node.js) stack, the application leverages OpenAI's GPT-4 model to generate customized workout routines and diet plans based on individual user profiles, health conditions, and fitness goals.

The platform serves as a complete health companion, offering real-time progress tracking, community engagement, e-commerce integration for fitness products, and intelligent recommendations powered by artificial intelligence. The system emphasizes user privacy, data security, and a seamless user experience across desktop and mobile devices.

### 1.3 Problem Statement
Traditional fitness applications often provide generic, one-size-fits-all solutions that fail to account for individual differences in health conditions, fitness levels, dietary preferences, and personal goals. Users struggle with:
- Lack of personalized guidance based on their specific health conditions
- Inability to track progress effectively across multiple fitness dimensions
- Absence of integrated solutions combining diet, exercise, and health monitoring
- Limited access to professional-grade fitness and nutrition advice
- Poor user experience with fragmented tools and services

### 1.4 Solution
Smart Health & Fitness Tracker addresses these challenges by:
- Providing AI-generated, personalized workout and diet plans tailored to individual profiles
- Integrating comprehensive progress tracking across diet, exercise, and health metrics
- Offering a unified platform combining multiple health and fitness services
- Delivering professional-grade recommendations through AI-powered analysis
- Ensuring an intuitive, responsive user interface accessible across all devices

---

## 2. Project Goals

### 2.1 Primary Goals

#### 2.1.1 Personalized Health Management
- **Goal**: Provide users with AI-generated, personalized fitness and nutrition plans based on their unique profile, health conditions, and fitness goals
- **Success Metrics**: 
  - 90% of users report plans align with their fitness goals
  - 80% user satisfaction rate with plan personalization
  - Plans adapt to 6+ different fitness goals (Muscle Building, Fat Burning, Weight Gain, Strength Training, Endurance Training, General Fitness)

#### 2.1.2 Comprehensive Progress Tracking
- **Goal**: Enable users to track and monitor their progress across diet, exercise, water intake, and overall health metrics
- **Success Metrics**:
  - Real-time progress updates with < 1 second latency
  - Weekly progress reports with visual analytics
  - 70% of active users track progress daily

#### 2.1.3 Health Condition Awareness
- **Goal**: Ensure all generated plans consider and accommodate user health conditions (Diabetes, PCOS, High Blood Pressure, etc.)
- **Success Metrics**:
  - Zero recommendations that conflict with stated health conditions
  - 95% accuracy in health condition consideration
  - Support for 4+ common health conditions

#### 2.1.4 User Engagement and Retention
- **Goal**: Create an engaging platform that encourages consistent use and long-term commitment to fitness goals
- **Success Metrics**:
  - 60% monthly active user rate
  - Average session duration > 15 minutes
  - 50% of users return within 7 days

### 2.2 Secondary Goals

#### 2.2.1 Community Building
- **Goal**: Foster a supportive community where users can share progress, experiences, and motivation
- **Success Metrics**:
  - 30% of users engage with community features
  - Average of 5+ posts per user per month
  - Positive community sentiment score > 4.0/5.0

#### 2.2.2 E-Commerce Integration
- **Goal**: Provide users with convenient access to fitness products, supplements, and health accessories
- **Success Metrics**:
  - 20% of users make purchases through the platform
  - Average order value > $50
  - Product catalog with 50+ items

#### 2.2.3 Scalability and Performance
- **Goal**: Build a scalable system capable of handling growth in user base and feature complexity
- **Success Metrics**:
  - Support for 10,000+ concurrent users
  - API response time < 500ms for 95% of requests
  - 99.9% uptime availability

---

## 3. Target Market

### 3.1 Primary Target Audience

#### 3.1.1 Fitness Enthusiasts (Ages 18-45)
- **Demographics**: 
  - Age: 18-45 years
  - Gender: All genders
  - Income: Middle to upper-middle class
  - Education: High school to college educated
- **Characteristics**:
  - Actively seeking to improve fitness and health
  - Comfortable with technology and mobile applications
  - Value personalized guidance and professional advice
  - Willing to invest time and resources in health improvement
- **Pain Points**:
  - Difficulty finding personalized workout and diet plans
  - Lack of time to research and create custom plans
  - Need for accountability and progress tracking
  - Desire for professional-grade fitness guidance

#### 3.1.2 Health-Conscious Individuals with Medical Conditions
- **Demographics**:
  - Age: 25-60 years
  - Health Conditions: Diabetes, PCOS, High Blood Pressure, Heart Disease
  - Income: Middle class and above
- **Characteristics**:
  - Require specialized dietary and exercise considerations
  - Need careful monitoring of health metrics
  - Value safety and health condition awareness
  - Seek professional guidance adapted to their limitations
- **Pain Points**:
  - Generic fitness plans don't account for health conditions
  - Risk of exercises or foods that worsen conditions
  - Need for continuous monitoring and adjustment
  - Difficulty finding trustworthy, condition-specific guidance

#### 3.1.3 Beginners Starting Fitness Journey
- **Demographics**:
  - Age: 18-40 years
  - Fitness Level: Beginner to intermediate
  - Income: All income levels
- **Characteristics**:
  - New to structured fitness and nutrition planning
  - Need guidance and education
  - Require motivation and support
  - Prefer simple, easy-to-follow plans
- **Pain Points**:
  - Overwhelmed by complex fitness information
  - Uncertainty about where to start
  - Lack of knowledge about proper form and nutrition
  - Need for encouragement and progress validation

### 3.2 Secondary Target Audience

#### 3.2.1 Athletes and Advanced Fitness Practitioners
- **Characteristics**: Seeking advanced training methodologies and optimization
- **Needs**: Progressive overload, periodization, advanced nutrition strategies

#### 3.2.2 Healthcare Professionals
- **Characteristics**: Looking for tools to recommend to patients
- **Needs**: Evidence-based recommendations, health condition considerations

### 3.3 Market Size and Opportunity
- **Global Fitness App Market**: $4.4 billion (2021), projected to reach $14.7 billion by 2028
- **Health and Wellness Market**: Growing at 6.4% CAGR
- **Target Addressable Market**: 500+ million fitness-conscious individuals globally
- **Geographic Focus**: Initially English-speaking markets, expandable globally

---

## 4. Use Cases

### 4.1 User Registration and Authentication

#### Use Case 4.1.1: User Registration
**Actor**: New User  
**Preconditions**: User has internet connection and valid email address  
**Main Flow**:
1. User navigates to registration page
2. User enters username (3-30 characters), email, and password (minimum 6 characters)
3. System validates input fields (email format, password strength, username uniqueness)
4. System creates user account with hashed password
5. System generates JWT token and sets HTTP-only cookie
6. System redirects user to onboarding page
7. User completes profile setup (age, gender, height, weight, health conditions, fitness goal)

**Alternative Flows**:
- 3a. Email already exists: System displays error message, user can login instead
- 3b. Username already taken: System suggests alternative usernames
- 3c. Weak password: System provides password strength feedback

**Postconditions**: User account created, user authenticated, profile data collected

#### Use Case 4.1.2: User Login
**Actor**: Registered User  
**Preconditions**: User has registered account  
**Main Flow**:
1. User navigates to login page
2. User enters email and password
3. System validates credentials against database
4. System checks if account is locked (due to failed attempts)
5. System verifies password using bcrypt comparison
6. On success, system generates JWT token, updates last login timestamp
7. System resets login attempts counter
8. User redirected to dashboard

**Alternative Flows**:
- 4a. Account locked: System displays lockout message with time remaining
- 5a. Invalid password: System increments login attempts, locks account after 5 failed attempts
- 5b. Account not found: System suggests registration

**Postconditions**: User authenticated, session established, dashboard accessible

#### Use Case 4.1.3: Password Reset
**Actor**: Registered User  
**Preconditions**: User has registered account, forgot password  
**Main Flow**:
1. User clicks "Forgot Password" link
2. User enters registered email address
3. System validates email exists in database
4. System generates secure reset token (SHA-256 hash)
5. System sets token expiration (10 minutes)
6. System sends password reset email with reset link
7. User clicks reset link in email
8. User enters new password
9. System validates token and expiration
10. System updates password with bcrypt hash
11. System invalidates reset token
12. User redirected to login page

**Alternative Flows**:
- 3a. Email not found: System displays generic message (security best practice)
- 7a. Token expired: System prompts user to request new reset link
- 7b. Invalid token: System displays error message

**Postconditions**: Password reset, user can login with new password

### 4.2 Profile Management

#### Use Case 4.2.1: Complete User Profile
**Actor**: Authenticated User  
**Preconditions**: User is logged in, on onboarding page  
**Main Flow**:
1. User enters age (13-120 years)
2. User selects gender (male, female, other)
3. User enters height in cm (50-300 cm)
4. User enters weight in kg (20-500 kg)
5. User selects health conditions (Diabetes, PCOS, High Blood Pressure, None)
6. User selects fitness goal (Muscle Building, Fat Burning, Weight Gain, General Fitness)
7. User optionally uploads profile image (base64 or URL)
8. System calculates BMI automatically
9. System saves profile data to user document
10. System redirects to dashboard

**Postconditions**: User profile complete, BMI calculated, ready for plan generation

#### Use Case 4.2.2: Update Profile Information
**Actor**: Authenticated User  
**Preconditions**: User has completed profile  
**Main Flow**:
1. User navigates to Profile page
2. User modifies profile fields (age, height, weight, health conditions, fitness goal)
3. System validates updated values
4. System recalculates BMI if height/weight changed
5. System updates user document in database
6. System displays success message
7. System may prompt user to regenerate plans if fitness goal changed

**Postconditions**: Profile updated, BMI recalculated, plans may need regeneration

### 4.3 AI-Powered Plan Generation

#### Use Case 4.3.1: Generate Personalized Diet Plan
**Actor**: Authenticated User  
**Preconditions**: User has completed profile, has fitness goal selected  
**Main Flow**:
1. User navigates to Diet Plan page
2. User clicks "Generate Diet Plan" button
3. System displays loading modal with step-by-step progress indicators
4. System constructs prompt with user profile data:
   - Age, gender, height, weight
   - Fitness goal (determines macro ratios)
   - Health conditions (affects food recommendations)
   - Current week of program (for progressive plans)
5. System sends prompt to OpenAI GPT-4 API (backend service)
6. AI generates 7-day diet plan with:
   - Daily meals (breakfast, lunch, dinner, optional snack)
   - Meal times
   - Calorie content per meal
   - Macronutrient breakdown (protein, carbs, fats)
   - Goal-specific macro ratios
   - Health condition considerations
7. System validates JSON response structure
8. System converts AI response to application format
9. System saves plan to localStorage (user-specific key)
10. System initializes plan metadata (start date, current week, renewal date)
11. System displays 7-day plan with interactive meal completion tracking
12. System updates progress context with meal data

**Alternative Flows**:
- 5a. Backend API unavailable: System falls back to frontend OpenAI service
- 5b. API quota exceeded: System displays error, suggests retry later
- 5c. Invalid API key: System prompts user to configure API key
- 7a. Invalid JSON response: System retries generation or displays error

**Postconditions**: 7-day diet plan generated, saved, displayed, progress tracking enabled

#### Use Case 4.3.2: Generate Personalized Workout Plan
**Actor**: Authenticated User  
**Preconditions**: User has completed profile  
**Main Flow**:
1. User navigates to Workout Plan page
2. User clicks "Generate Workout Plan" button
3. System displays loading modal with workout-specific progress messages
4. System constructs prompt with user profile and preferences:
   - Fitness goal (determines exercise selection and intensity)
   - Health conditions (affects exercise safety)
   - Equipment availability (gym, home, none)
   - Experience level
   - Current week of program
5. System sends prompt to OpenAI GPT-4 API
6. AI generates 6-day workout plan (Monday-Saturday) with:
   - Day-specific exercise routines
   - Exercise names with descriptions
   - Sets and repetitions (goal-specific)
   - Rest periods between sets
   - Equipment requirements
   - Warmup and cooldown exercises
   - Duration per workout session
7. System validates JSON response (all 6 days present)
8. System converts to application format
9. System saves plan to localStorage
10. System initializes workout plan metadata
11. System displays interactive workout plan with exercise completion tracking
12. System updates progress context

**Alternative Flows**:
- 6a. Health condition conflicts: AI avoids unsafe exercises automatically
- 6b. Equipment mismatch: AI adapts exercises to available equipment
- 7a. Incomplete plan: System requests regeneration

**Postconditions**: 6-day workout plan generated, exercise tracking enabled, progress initialized

#### Use Case 4.3.3: Get AI Health Recommendations
**Actor**: Authenticated User  
**Preconditions**: User has progress data (diet/workout completion)  
**Main Flow**:
1. User views dashboard
2. System analyzes user progress data:
   - Diet completion rate
   - Workout completion rate
   - Weekly progress trends
   - Calorie consumption vs targets
   - Exercise completion statistics
3. System constructs analysis prompt with progress summary
4. System sends to OpenAI API for recommendations
5. AI generates personalized recommendations:
   - Motivation messages (celebrate achievements)
   - Warnings (concerning patterns, health risks)
   - Suggestions (practical improvements)
   - Achievement recognition (milestones reached)
6. System displays recommendations with priority levels (high, medium, low)
7. System categorizes by type (motivation, warning, suggestion, achievement)

**Postconditions**: AI recommendations displayed, user receives actionable insights

### 4.4 Progress Tracking

#### Use Case 4.4.1: Track Diet Progress
**Actor**: Authenticated User  
**Preconditions**: User has active diet plan  
**Main Flow**:
1. User views diet plan for current day
2. User marks meal as completed (breakfast, lunch, dinner)
3. System updates meal completion status in localStorage
4. System calculates:
   - Daily completed meals count
   - Daily calories consumed
   - Daily macros consumed (protein, carbs, fats)
   - Weekly meal completion rate
   - Weekly calorie consumption
5. System updates progress context
6. System updates dashboard statistics in real-time
7. System triggers AI recommendation refresh if significant progress made

**Postconditions**: Meal marked complete, progress updated, statistics refreshed

#### Use Case 4.4.2: Track Workout Progress
**Actor**: Authenticated User  
**Preconditions**: User has active workout plan  
**Main Flow**:
1. User views workout plan for current day
2. User marks individual exercises as completed
3. System updates exercise completion status
4. User completes all exercises for a day
5. System marks entire workout day as completed
6. System calculates:
   - Daily exercise completion count
   - Weekly workout completion rate
   - Total exercises completed vs total
   - Workout days completed this week
7. System updates progress context
8. System updates dashboard workout statistics
9. System archives completed workout data

**Postconditions**: Exercise/workout completed, progress tracked, statistics updated

#### Use Case 4.4.3: Track Water Intake
**Actor**: Authenticated User  
**Preconditions**: User is on dashboard  
**Main Flow**:
1. User views water intake tracker widget
2. User clicks "+" button to add glass of water (250ml)
3. System increments water intake counter
4. System calculates percentage of daily goal (default 8 glasses = 2L)
5. System updates visual progress bar
6. System saves to localStorage
7. System resets daily at midnight

**Postconditions**: Water intake logged, progress visualized, daily goal tracked

### 4.5 Plan Renewal and Progression

#### Use Case 4.5.1: Automatic Diet Plan Renewal
**Actor**: System (Automated)  
**Preconditions**: User has active diet plan, 7 days have passed since plan start  
**Main Flow**:
1. System checks diet plan metadata on user login or daily check
2. System compares current date with renewal date
3. If renewal date reached and current week < total weeks:
   - System generates progressive prompt for next week
   - System calls AI service to generate new 7-day plan
   - System archives current week's plan
   - System clears previous week's progress data
   - System saves new plan to localStorage
   - System updates metadata (current week++, new renewal date)
   - System displays renewal notification
4. User sees new week's plan automatically

**Postconditions**: Plan renewed, progress archived, new week active

#### Use Case 4.5.2: Automatic Workout Plan Renewal
**Actor**: System (Automated)  
**Preconditions**: User has active workout plan, 6 days have passed  
**Main Flow**:
1. System checks workout plan metadata
2. System compares dates, triggers renewal if needed
3. System generates progressive workout prompt (increased difficulty)
4. System calls AI service for new 6-day plan
5. System archives previous plan
6. System updates metadata and displays notification

**Postconditions**: Workout plan renewed with progressive difficulty

### 4.6 Community Features

#### Use Case 4.6.1: Create Community Post
**Actor**: Authenticated User  
**Preconditions**: User is logged in, on Community page  
**Main Flow**:
1. User clicks "Create Post" button
2. User uploads image (JPG, PNG, max 10MB)
3. User enters caption (max 300 characters)
4. System validates image format and size
5. System uploads image to server (Multer middleware)
6. System saves image to /uploads directory
7. System creates Post document with:
   - User reference
   - Image URL
   - Caption
   - Timestamp
8. System displays post in community feed
9. Other users can view, like, and comment

**Postconditions**: Post created, visible in community feed

#### Use Case 4.6.2: Interact with Community Posts
**Actor**: Authenticated User  
**Preconditions**: Community posts exist  
**Main Flow**:
1. User views community feed
2. User clicks "Like" button on a post
3. System toggles like status (add/remove user ID from likes array)
4. System updates like count in real-time
5. User clicks "Comment" button
6. User enters comment text (max 500 characters)
7. System adds comment to post's comments array
8. System displays comment with user name and timestamp

**Postconditions**: Post liked/commented, interaction saved

### 4.7 E-Commerce Features

#### Use Case 4.7.1: Browse Store Products
**Actor**: Authenticated User  
**Preconditions**: User is on Store page  
**Main Flow**:
1. User views store product catalog
2. System displays products with:
   - Product image
   - Product name
   - Description
   - Price
   - Category (supplements, equipment, accessories)
3. User can filter by category
4. User can search products by name
5. User clicks product to view details
6. User adds product to cart

**Postconditions**: Products displayed, cart updated

#### Use Case 4.7.2: Complete Purchase
**Actor**: Authenticated User  
**Preconditions**: User has items in cart  
**Main Flow**:
1. User navigates to Cart page
2. User reviews cart items and total
3. User clicks "Checkout"
4. User enters payment information:
   - Card number, expiry, CVV
   - Billing address
   - Shipping address
5. System validates payment form
6. System processes payment (simulated - no real payment gateway)
7. System displays payment success page
8. System clears cart
9. System sends order confirmation (simulated)

**Postconditions**: Order placed, cart cleared, confirmation displayed

### 4.8 Settings and Account Management

#### Use Case 4.8.1: Configure Notification Settings
**Actor**: Authenticated User  
**Preconditions**: User is on Settings page  
**Main Flow**:
1. User views "Workout Reminders" section
2. User toggles "Enable Reminders" switch
3. System requests browser notification permission
4. If granted, user selects reminder time (e.g., 7:00 AM)
5. System schedules daily notification at selected time
6. System saves settings to localStorage
7. System sends test notification if enabled
8. User can enable/disable sound effects for notifications

**Postconditions**: Notifications configured, scheduled, settings saved

#### Use Case 4.8.2: Delete User Account
**Actor**: Authenticated User  
**Preconditions**: User wants to delete account  
**Main Flow**:
1. User navigates to Settings > Account Management
2. User clicks "Delete Account" button
3. System displays warning modal
4. User must type "DELETE MY ACCOUNT" to confirm
5. System validates confirmation text
6. System sends DELETE request to backend API
7. Backend deletes user document from MongoDB
8. Backend deletes associated posts (cascade delete)
9. System clears all localStorage data
10. System clears authentication cookies
11. System redirects to login page
12. System displays success message

**Postconditions**: Account permanently deleted, all data removed, user logged out

### 4.9 Theme and UI Customization

#### Use Case 4.9.1: Switch Between Light/Dark Theme
**Actor**: Authenticated User  
**Preconditions**: User is on any page  
**Main Flow**:
1. User clicks theme toggle button (moon/sun icon)
2. System toggles theme state (light ↔ dark)
3. System applies theme classes to all components
4. System saves preference to localStorage
5. System syncs with system theme preference (optional)
6. All pages update theme instantly with smooth transitions

**Postconditions**: Theme changed, preference saved, UI updated

---

## 5. Functional Requirements

### 5.1 Authentication and Authorization Requirements

#### FR-1: User Registration
- **FR-1.1**: The system SHALL allow users to register with a unique username (3-30 characters), valid email address, and password (minimum 6 characters).
- **FR-1.2**: The system SHALL validate email format using regex pattern matching.
- **FR-1.3**: The system SHALL ensure username uniqueness across all registered users.
- **FR-1.4**: The system SHALL ensure email uniqueness across all registered users.
- **FR-1.5**: The system SHALL hash passwords using bcrypt with salt rounds of 12 before storing in database.
- **FR-1.6**: The system SHALL generate a JWT token upon successful registration.
- **FR-1.7**: The system SHALL set JWT token as HTTP-only cookie with 7-day expiration.
- **FR-1.8**: The system SHALL redirect users to onboarding page after registration.
- **FR-1.9**: The system SHALL display appropriate error messages for validation failures (duplicate email, weak password, invalid format).

#### FR-2: User Login
- **FR-2.1**: The system SHALL authenticate users using email and password.
- **FR-2.2**: The system SHALL verify password using bcrypt comparison against stored hash.
- **FR-2.3**: The system SHALL track failed login attempts per user account.
- **FR-2.4**: The system SHALL lock user account after 5 consecutive failed login attempts for 2 hours.
- **FR-2.5**: The system SHALL reset login attempts counter upon successful login.
- **FR-2.6**: The system SHALL update last login timestamp upon successful authentication.
- **FR-2.7**: The system SHALL generate new JWT token on each login.
- **FR-2.8**: The system SHALL display account lockout message with remaining lockout time if account is locked.
- **FR-2.9**: The system SHALL prevent login attempts while account is locked.

#### FR-3: Password Reset
- **FR-3.1**: The system SHALL allow users to request password reset via email address.
- **FR-3.2**: The system SHALL generate secure reset token using crypto.randomBytes(32) and SHA-256 hashing.
- **FR-3.3**: The system SHALL set reset token expiration to 10 minutes from generation.
- **FR-3.4**: The system SHALL send password reset email with reset link containing token.
- **FR-3.5**: The system SHALL validate reset token and expiration before allowing password change.
- **FR-3.6**: The system SHALL invalidate reset token after successful password reset.
- **FR-3.7**: The system SHALL reset login attempts counter upon password reset.
- **FR-3.8**: The system SHALL hash new password with bcrypt before storing.
- **FR-3.9**: The system SHALL display appropriate error messages for invalid or expired tokens.

#### FR-4: Session Management
- **FR-4.1**: The system SHALL maintain user session using JWT tokens stored in HTTP-only cookies.
- **FR-4.2**: The system SHALL validate JWT token on each protected route request.
- **FR-4.3**: The system SHALL extract user information (ID, email, username) from JWT token.
- **FR-4.4**: The system SHALL expire JWT tokens after 7 days of inactivity.
- **FR-4.5**: The system SHALL allow users to logout, clearing authentication cookies.
- **FR-4.6**: The system SHALL redirect unauthenticated users to login page when accessing protected routes.

### 5.2 User Profile Management Requirements

#### FR-5: Profile Creation and Update
- **FR-5.1**: The system SHALL require users to complete profile during onboarding with: age (13-120), gender (male/female/other), height (50-300 cm), weight (20-500 kg), health conditions (Diabetes/PCOS/High Blood Pressure/None), fitness goal (Muscle Building/Fat Burning/Weight Gain/General Fitness).
- **FR-5.2**: The system SHALL calculate BMI automatically using formula: weight (kg) / (height (m))² when height and weight are provided.
- **FR-5.3**: The system SHALL allow users to update profile information at any time.
- **FR-5.4**: The system SHALL recalculate BMI automatically when height or weight is updated.
- **FR-5.5**: The system SHALL allow users to upload profile image (base64 string or URL).
- **FR-5.6**: The system SHALL validate all profile inputs (age range, height range, weight range, enum values for gender/health conditions/fitness goal).
- **FR-5.7**: The system SHALL store profile data in user document's profile subdocument.
- **FR-5.8**: The system SHALL prompt users to regenerate plans when fitness goal changes significantly.

### 5.3 AI-Powered Plan Generation Requirements

#### FR-6: Diet Plan Generation
- **FR-6.1**: The system SHALL generate personalized 7-day diet plans using OpenAI GPT-4 API based on user profile data.
- **FR-6.2**: The system SHALL construct prompts including: age, gender, height, weight, fitness goal, health conditions, current week of program.
- **FR-6.3**: The system SHALL ensure diet plans align with fitness goals:
  - Fat Burning: High protein (35-40%), Low carbs (25-30%), Low fats (25-30%), Calorie deficit (15-20% below maintenance)
  - Muscle Building: High protein (25-30%), High carbs (45-50%), Moderate fats (20-25%), Calorie surplus (10-15% above maintenance)
  - Weight Gain: Moderate protein (20-25%), High carbs (50-55%), Higher fats (25-30%), Significant surplus (15-25% above maintenance)
  - General Fitness: Balanced protein (25%), Moderate carbs (45%), Moderate fats (30%), Maintenance calories
- **FR-6.4**: The system SHALL exclude foods that conflict with user's health conditions (e.g., high sugar for diabetes, high sodium for high blood pressure).
- **FR-6.5**: The system SHALL generate plans with daily meals: breakfast (8:00 AM), lunch (12:00 PM), dinner (6:00 PM), optional evening snack (10:00 PM, 80-150 calories max).
- **FR-6.6**: The system SHALL provide calorie content and macronutrient breakdown (protein, carbs, fats in grams) for each meal.
- **FR-6.7**: The system SHALL return plans in valid JSON format with structure: {day: {breakfast: {time, foods[], calories}, lunch: {...}, dinner: {...}, macros: {protein, carbs, fats}, dailyCalories, tips[]}}.
- **FR-6.8**: The system SHALL validate JSON response structure before saving.
- **FR-6.9**: The system SHALL handle API errors gracefully (quota exceeded, invalid key, network errors) with fallback to frontend service.
- **FR-6.10**: The system SHALL display loading modal with step-by-step progress indicators during generation.
- **FR-6.11**: The system SHALL save generated plans to localStorage with user-specific keys (dietPlan_{userId}).
- **FR-6.12**: The system SHALL initialize plan metadata (startDate, currentWeek, renewalDate, totalWeeks, planType) upon plan generation.

#### FR-7: Workout Plan Generation
- **FR-7.1**: The system SHALL generate personalized 6-day workout plans (Monday-Saturday) using OpenAI GPT-4 API.
- **FR-7.2**: The system SHALL construct prompts including fitness goal, health conditions, equipment availability, experience level, current week.
- **FR-7.3**: The system SHALL ensure workout plans align with fitness goals:
  - Fat Burning: High-intensity cardio (15-20 reps, 30-45 sec rest), HIIT workouts, 4-5 cardio days, 2-3 strength days per week
  - Muscle Building: Heavy weight training (6-12 reps, 60-90 sec rest), Progressive overload, 4-5 strength days, 1-2 light cardio days
  - Weight Gain: Moderate weight training (8-12 reps, 60-90 sec rest), Compound lifts, Limited cardio (2-3 days max)
  - General Fitness: Balanced mix (3 strength, 2-3 cardio, 1 flexibility), Moderate intensity (10-15 reps, 45-60 sec rest)
- **FR-7.4**: The system SHALL exclude exercises that conflict with health conditions (e.g., high-intensity for heart disease, jumping for joint problems).
- **FR-7.5**: The system SHALL provide exercise details: name with description, sets, repetitions, rest time between sets, equipment required.
- **FR-7.6**: The system SHALL include warmup and cooldown exercises for each workout day.
- **FR-7.7**: The system SHALL provide workout duration estimate for each day.
- **FR-7.8**: The system SHALL return plans in valid JSON format with structure: {Monday: {exercises: [{name, sets, reps, restTime, equipment}], duration, warmup[], cooldown[]}, ...}.
- **FR-7.9**: The system SHALL validate that all 6 days (Monday-Saturday) are present in response.
- **FR-7.10**: The system SHALL handle API errors with fallback mechanisms.
- **FR-7.11**: The system SHALL save workout plans to localStorage (workoutPlan_{userId}).
- **FR-7.12**: The system SHALL initialize workout plan metadata upon generation.

#### FR-8: AI Recommendations
- **FR-8.1**: The system SHALL generate personalized health recommendations based on user progress data.
- **FR-8.2**: The system SHALL analyze: diet completion rate, workout completion rate, weekly progress trends, calorie consumption vs targets, exercise statistics.
- **FR-8.3**: The system SHALL generate recommendations categorized by type: motivation (encouragement, celebrate progress), warning (concerning patterns, health risks), suggestion (practical improvements), achievement (milestone recognition).
- **FR-8.4**: The system SHALL assign priority levels: high (critical issues), medium (important improvements), low (nice-to-have optimizations).
- **FR-8.5**: The system SHALL display recommendations on dashboard with visual indicators for type and priority.
- **FR-8.6**: The system SHALL refresh recommendations when significant progress changes occur.

### 5.4 Progress Tracking Requirements

#### FR-9: Diet Progress Tracking
- **FR-9.1**: The system SHALL allow users to mark individual meals (breakfast, lunch, dinner) as completed.
- **FR-9.2**: The system SHALL track daily meal completion count (completed meals / total meals for the day).
- **FR-9.3**: The system SHALL calculate daily calories consumed from completed meals.
- **FR-9.4**: The system SHALL calculate daily macronutrients consumed (protein, carbs, fats in grams) from completed meals.
- **FR-9.5**: The system SHALL track weekly meal completion rate (weekly completed meals / weekly total meals).
- **FR-9.6**: The system SHALL calculate weekly calories consumed.
- **FR-9.7**: The system SHALL update progress context in real-time when meals are marked complete.
- **FR-9.8**: The system SHALL persist progress data to localStorage (dietProgress_{userId}).
- **FR-9.9**: The system SHALL reset daily progress at midnight (new day).
- **FR-9.10**: The system SHALL archive weekly progress when week completes.
- **FR-9.11**: The system SHALL display progress statistics on dashboard (completion percentage, calories consumed, macros breakdown).

#### FR-10: Workout Progress Tracking
- **FR-10.1**: The system SHALL allow users to mark individual exercises as completed.
- **FR-10.2**: The system SHALL track daily exercise completion (completed exercises / total exercises for the day).
- **FR-10.3**: The system SHALL mark entire workout day as completed when all exercises are completed.
- **FR-10.4**: The system SHALL track weekly workout completion rate (completed workouts / total workouts for the week).
- **FR-10.5**: The system SHALL track total exercises completed vs total exercises available.
- **FR-10.6**: The system SHALL track workout days completed this week.
- **FR-10.7**: The system SHALL update progress context in real-time.
- **FR-10.8**: The system SHALL persist workout progress to localStorage (workoutProgress_{userId}).
- **FR-10.9**: The system SHALL reset weekly progress when new week starts.
- **FR-10.10**: The system SHALL archive completed workout data.
- **FR-10.11**: The system SHALL display workout statistics on dashboard (completion rate, workouts completed, exercises completed).

#### FR-11: Water Intake Tracking
- **FR-11.1**: The system SHALL allow users to log water intake by clicking "+" button (adds 250ml glass).
- **FR-11.2**: The system SHALL track daily water intake in milliliters.
- **FR-11.3**: The system SHALL set default daily goal to 8 glasses (2000ml / 2L).
- **FR-11.4**: The system SHALL calculate percentage of daily goal completed.
- **FR-11.5**: The system SHALL display visual progress bar showing water intake progress.
- **FR-11.6**: The system SHALL reset daily water intake at midnight.
- **FR-11.7**: The system SHALL persist water intake data to localStorage.

### 5.5 Plan Renewal and Progression Requirements

#### FR-12: Automatic Plan Renewal
- **FR-12.1**: The system SHALL automatically check for diet plan renewal eligibility every 7 days from plan start date.
- **FR-12.2**: The system SHALL automatically check for workout plan renewal eligibility every 6 days from plan start date.
- **FR-12.3**: The system SHALL renew plans only if current week < total weeks in program.
- **FR-12.4**: The system SHALL generate progressive prompts for renewed plans (increased difficulty, new exercises/meals, week-specific adjustments).
- **FR-12.5**: The system SHALL archive current week's plan before renewal (save to planArchive_week{X}_{userId}).
- **FR-12.6**: The system SHALL clear previous week's progress data upon renewal.
- **FR-12.7**: The system SHALL update plan metadata (currentWeek++, new renewalDate, lastRenewalDate).
- **FR-12.8**: The system SHALL display renewal notification to user when plan is renewed.
- **FR-12.9**: The system SHALL save renewal notifications to localStorage (planRenewalNotifications array, max 10 notifications).

#### FR-13: Progressive Plan Adjustments
- **FR-13.1**: The system SHALL adjust diet plans based on program phase:
  - Foundation Phase (Weeks 1-4): Easier-to-follow meals, gradual changes, emphasis on consistency
  - Progression Phase (Weeks 5-70% of total): More varied meals, fine-tuned macros
  - Advanced Phase (Weeks 70%+): Maximum optimization, advanced meal timing, macro cycling
- **FR-13.2**: The system SHALL adjust workout plans based on program phase:
  - Foundation Phase: Focus on form/technique, moderate intensity (2-3 sets, 12-15 reps, 60-90 sec rest)
  - Progression Phase: Increased intensity (3-4 sets, 8-12 reps, 90-120 sec rest)
  - Advanced Phase: Peak performance (3-5 sets, 6-10 reps, 2-3 min rest)
- **FR-13.3**: The system SHALL introduce new exercises and meal varieties in each renewal to prevent boredom.
- **FR-13.4**: The system SHALL increase difficulty progressively while maintaining safety for health conditions.

### 5.6 Community Features Requirements

#### FR-14: Community Posts
- **FR-14.1**: The system SHALL allow authenticated users to create posts with image upload and caption (max 300 characters).
- **FR-14.2**: The system SHALL validate image format (JPG, PNG) and size (max 10MB).
- **FR-14.3**: The system SHALL upload images to server using Multer middleware.
- **FR-14.4**: The system SHALL save images to /uploads directory with unique filenames (timestamp-randomNumber.extension).
- **FR-14.5**: The system SHALL create Post document with: user reference (ObjectId), imageUrl (path), caption, likes array (user ObjectIds), comments array, timestamps.
- **FR-14.6**: The system SHALL display posts in community feed sorted by creation date (newest first).
- **FR-14.7**: The system SHALL allow users to like/unlike posts (toggle like status).
- **FR-14.8**: The system SHALL allow users to add comments to posts (max 500 characters per comment).
- **FR-14.9**: The system SHALL display comments with user name and timestamp.
- **FR-14.10**: The system SHALL allow post owners to delete their own posts.
- **FR-14.11**: The system SHALL delete associated image file when post is deleted.

### 5.7 E-Commerce Requirements

#### FR-15: Store and Shopping Cart
- **FR-15.1**: The system SHALL display product catalog with: product image, name, description, price, category.
- **FR-15.2**: The system SHALL allow users to filter products by category (supplements, equipment, accessories).
- **FR-15.3**: The system SHALL allow users to search products by name.
- **FR-15.4**: The system SHALL allow users to add products to shopping cart.
- **FR-15.5**: The system SHALL maintain cart state in localStorage (cart_{userId}).
- **FR-15.6**: The system SHALL calculate cart total (sum of product prices).
- **FR-15.7**: The system SHALL allow users to remove items from cart.
- **FR-15.8**: The system SHALL allow users to update item quantities in cart.
- **FR-15.9**: The system SHALL display cart summary with itemized list and total.

#### FR-16: Payment Processing
- **FR-16.1**: The system SHALL provide payment form for: card number, expiry date, CVV, billing address, shipping address.
- **FR-16.2**: The system SHALL validate payment form inputs (card number format, expiry date validity, CVV length, address completeness).
- **FR-16.3**: The system SHALL process payment (simulated - no real payment gateway integration).
- **FR-16.4**: The system SHALL display payment success page upon successful processing.
- **FR-16.5**: The system SHALL clear cart after successful payment.
- **FR-16.6**: The system SHALL send order confirmation (simulated email).

### 5.8 Settings and Account Management Requirements

#### FR-17: Notification Settings
- **FR-17.1**: The system SHALL allow users to enable/disable workout reminders.
- **FR-17.2**: The system SHALL request browser notification permission when reminders are enabled.
- **FR-17.3**: The system SHALL allow users to set custom reminder time (hour and minute).
- **FR-17.4**: The system SHALL schedule daily notifications at user-specified time.
- **FR-17.5**: The system SHALL send browser notifications with title "🏋️ Workout Reminder" and custom message.
- **FR-17.6**: The system SHALL allow users to enable/disable sound effects for notifications.
- **FR-17.7**: The system SHALL play notification sound when enabled (using Web Audio API or HTML5 audio).
- **FR-17.8**: The system SHALL save notification settings to localStorage (appSettings_{userId}).
- **FR-17.9**: The system SHALL display notification permission status (granted/denied/default).

#### FR-18: Account Deletion
- **FR-18.1**: The system SHALL allow users to delete their account from Settings page.
- **FR-18.2**: The system SHALL require users to type "DELETE MY ACCOUNT" exactly to confirm deletion.
- **FR-18.3**: The system SHALL validate confirmation text before proceeding.
- **FR-18.4**: The system SHALL send DELETE request to backend API (/api/auth/deleteaccount).
- **FR-18.5**: The system SHALL delete user document from MongoDB database.
- **FR-18.6**: The system SHALL delete all user's posts (cascade delete).
- **FR-18.7**: The system SHALL clear all localStorage data associated with user.
- **FR-18.8**: The system SHALL clear authentication cookies.
- **FR-18.9**: The system SHALL redirect user to login page after deletion.
- **FR-18.10**: The system SHALL display success message confirming account deletion.

### 5.9 UI/UX Requirements

#### FR-19: Theme Management
- **FR-19.1**: The system SHALL support light and dark themes.
- **FR-19.2**: The system SHALL allow users to toggle between themes using theme toggle button.
- **FR-19.3**: The system SHALL save theme preference to localStorage.
- **FR-19.4**: The system SHALL apply theme preference on page load.
- **FR-19.5**: The system SHALL sync theme with system preference (optional, if supported by browser).
- **FR-19.6**: The system SHALL apply theme transitions smoothly (no flash of wrong theme).

#### FR-20: Responsive Design
- **FR-20.1**: The system SHALL be responsive and functional on desktop (1920x1080 and above), tablet (768px-1024px), and mobile devices (320px-767px).
- **FR-20.2**: The system SHALL use mobile-first CSS approach.
- **FR-20.3**: The system SHALL optimize navigation for mobile (collapsible menus, sticky headers).
- **FR-20.4**: The system SHALL provide touch-friendly interface elements (large buttons, adequate spacing).
- **FR-20.5**: The system SHALL optimize images for mobile (WebP format, lazy loading, compressed sizes).

#### FR-21: Loading States and Feedback
- **FR-21.1**: The system SHALL display loading modals during AI plan generation with step-by-step progress indicators.
- **FR-21.2**: The system SHALL show contextual status messages (e.g., "Generating diet plan...", "Analyzing your profile...").
- **FR-21.3**: The system SHALL display success/error alerts for important actions (account deletion, plan generation, etc.).
- **FR-21.4**: The system SHALL provide visual feedback for user interactions (button clicks, form submissions).
- **FR-21.5**: The system SHALL display error messages clearly with actionable guidance.

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

#### NFR-1: Response Time
- **NFR-1.1**: The system SHALL respond to API requests within 500ms for 95% of requests under normal load conditions.
- **NFR-1.2**: The system SHALL load dashboard page within 2 seconds on 3G connection.
- **NFR-1.3**: The system SHALL render initial page content (First Contentful Paint) within 1.5 seconds.
- **NFR-1.4**: The system SHALL complete AI plan generation within 30-40 seconds (optimized from previous 60+ seconds).
- **NFR-1.5**: The system SHALL update progress tracking in real-time with < 1 second latency.
- **NFR-1.6**: The system SHALL handle image uploads (max 10MB) within 5 seconds.

#### NFR-2: Throughput
- **NFR-2.1**: The system SHALL handle at least 100 concurrent users without performance degradation.
- **NFR-2.2**: The system SHALL support 10,000+ registered users.
- **NFR-2.3**: The system SHALL process at least 100 API requests per second per server instance.
- **NFR-2.4**: The system SHALL handle 50+ simultaneous AI plan generation requests with queue management.

#### NFR-3: Resource Utilization
- **NFR-3.1**: The system SHALL optimize bundle size (frontend JavaScript) to < 500KB gzipped.
- **NFR-3.2**: The system SHALL optimize images using WebP format and compression.
- **NFR-3.3**: The system SHALL implement code splitting for route-based lazy loading.
- **NFR-3.4**: The system SHALL cache static assets with appropriate cache headers (1 year for immutable assets).
- **NFR-3.5**: The system SHALL limit API response payloads to < 1MB for standard requests.

### 6.2 Scalability Requirements

#### NFR-4: Horizontal Scalability
- **NFR-4.1**: The system SHALL be designed to scale horizontally (add more server instances) without code changes.
- **NFR-4.2**: The system SHALL use stateless authentication (JWT tokens) to support load balancing.
- **NFR-4.3**: The system SHALL support database replication and sharding for MongoDB.
- **NFR-4.4**: The system SHALL handle database connection pooling (min 5, max 50 connections per instance).

#### NFR-5: Vertical Scalability
- **NFR-5.1**: The system SHALL efficiently utilize available CPU and memory resources.
- **NFR-5.2**: The system SHALL handle memory leaks prevention (proper cleanup of event listeners, timers).
- **NFR-5.3**: The system SHALL implement efficient database queries with proper indexing.

### 6.3 Reliability and Availability Requirements

#### NFR-6: System Uptime
- **NFR-6.1**: The system SHALL maintain 99.9% uptime availability (less than 8.76 hours downtime per year).
- **NFR-6.2**: The system SHALL implement health check endpoints (/api/health) for monitoring.
- **NFR-6.3**: The system SHALL handle graceful degradation when external services (OpenAI API) are unavailable.
- **NFR-6.4**: The system SHALL implement fallback mechanisms for AI service (backend → frontend service).
- **NFR-6.5**: The system SHALL log errors and exceptions for debugging and monitoring.

#### NFR-7: Data Persistence
- **NFR-7.1**: The system SHALL ensure data persistence with MongoDB Atlas (cloud database with backups).
- **NFR-7.2**: The system SHALL implement data validation at database level (Mongoose schemas).
- **NFR-7.3**: The system SHALL backup user data regularly (MongoDB Atlas automated backups).
- **NFR-7.4**: The system SHALL handle database connection failures gracefully with retry logic.

### 6.4 Security Requirements

#### NFR-8: Authentication and Authorization Security
- **NFR-8.1**: The system SHALL use HTTPS for all communications (TLS 1.2 or higher).
- **NFR-8.2**: The system SHALL hash passwords using bcrypt with salt rounds of 12 (industry standard).
- **NFR-8.3**: The system SHALL store JWT tokens in HTTP-only cookies to prevent XSS attacks.
- **NFR-8.4**: The system SHALL implement CSRF protection for state-changing operations.
- **NFR-8.5**: The system SHALL validate and sanitize all user inputs to prevent injection attacks.
- **NFR-8.6**: The system SHALL implement rate limiting (100 requests per 15 minutes per IP) to prevent brute force attacks.
- **NFR-8.7**: The system SHALL lock user accounts after 5 failed login attempts for 2 hours.

#### NFR-9: Data Security
- **NFR-9.1**: The system SHALL encrypt sensitive data in transit (HTTPS/TLS).
- **NFR-9.2**: The system SHALL ensure user data isolation (users can only access their own data).
- **NFR-9.3**: The system SHALL implement proper access control on API endpoints (authentication middleware).
- **NFR-9.4**: The system SHALL store API keys and secrets in environment variables, not in code.
- **NFR-9.5**: The system SHALL implement input validation using express-validator middleware.
- **NFR-9.6**: The system SHALL sanitize file uploads (validate MIME types, scan for malicious content).
- **NFR-9.7**: The system SHALL implement secure password reset tokens with expiration (10 minutes).

#### NFR-10: Security Headers
- **NFR-10.1**: The system SHALL implement Helmet.js security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection).
- **NFR-10.2**: The system SHALL configure CORS properly (allow only frontend origin, credentials: true).
- **NFR-10.3**: The system SHALL prevent information disclosure in error messages (generic error messages for users, detailed logs for developers).

### 6.5 Usability Requirements

#### NFR-11: User Interface Usability
- **NFR-11.1**: The system SHALL provide intuitive navigation with clear menu structure.
- **NFR-11.2**: The system SHALL display consistent UI elements and design patterns throughout the application.
- **NFR-11.3**: The system SHALL provide clear visual feedback for user actions (hover states, active states, loading indicators).
- **NFR-11.4**: The system SHALL use accessible color contrast ratios (WCAG AA compliance: 4.5:1 for normal text, 3:1 for large text).
- **NFR-11.5**: The system SHALL support keyboard navigation for all interactive elements.
- **NFR-11.6**: The system SHALL provide tooltips and help text for complex features.

#### NFR-12: Accessibility Requirements
- **NFR-12.1**: The system SHALL support screen readers with proper ARIA labels and semantic HTML.
- **NFR-12.2**: The system SHALL provide alternative text for images.
- **NFR-12.3**: The system SHALL ensure form inputs have associated labels.
- **NFR-12.4**: The system SHALL support keyboard-only navigation (Tab, Enter, Escape keys).
- **NFR-12.5**: The system SHALL maintain focus indicators for keyboard navigation.

#### NFR-13: Error Handling and User Feedback
- **NFR-13.1**: The system SHALL display user-friendly error messages (avoid technical jargon).
- **NFR-13.2**: The system SHALL provide actionable guidance in error messages (what went wrong, how to fix it).
- **NFR-13.3**: The system SHALL validate forms in real-time (show errors as user types, not only on submit).
- **NFR-13.4**: The system SHALL prevent form submission with invalid data.
- **NFR-13.5**: The system SHALL display success confirmations for important actions (account deletion, plan generation, etc.).

### 6.6 Compatibility Requirements

#### NFR-14: Browser Compatibility
- **NFR-14.1**: The system SHALL support modern browsers: Chrome (latest 2 versions), Firefox (latest 2 versions), Safari (latest 2 versions), Edge (latest 2 versions).
- **NFR-14.2**: The system SHALL gracefully degrade for older browsers (show basic functionality, hide advanced features).
- **NFR-14.3**: The system SHALL use feature detection for browser capabilities (Notifications API, LocalStorage, etc.).
- **NFR-14.4**: The system SHALL provide polyfills for essential features if needed.

#### NFR-15: Device Compatibility
- **NFR-15.1**: The system SHALL be fully functional on desktop computers (Windows, macOS, Linux).
- **NFR-15.2**: The system SHALL be fully functional on mobile devices (iOS 12+, Android 8+).
- **NFR-15.3**: The system SHALL be functional on tablets (iPad, Android tablets).
- **NFR-15.4**: The system SHALL adapt layout and functionality based on screen size (responsive breakpoints: mobile < 768px, tablet 768-1024px, desktop > 1024px).

### 6.7 Maintainability Requirements

#### NFR-16: Code Quality
- **NFR-16.1**: The system SHALL follow consistent coding standards (ESLint for JavaScript/TypeScript).
- **NFR-16.2**: The system SHALL use TypeScript for type safety in frontend code.
- **NFR-16.3**: The system SHALL implement modular component architecture (reusable components).
- **NFR-16.4**: The system SHALL follow DRY (Don't Repeat Yourself) principles.
- **NFR-16.5**: The system SHALL include code comments for complex logic.
- **NFR-16.6**: The system SHALL organize code into logical directories (components, services, utils, contexts).

#### NFR-17: Documentation
- **NFR-17.1**: The system SHALL include README files with setup instructions.
- **NFR-17.2**: The system SHALL document API endpoints with request/response examples.
- **NFR-17.3**: The system SHALL document environment variables required for configuration.
- **NFR-17.4**: The system SHALL include inline code comments for complex algorithms.

### 6.8 Portability Requirements

#### NFR-18: Deployment Portability
- **NFR-18.1**: The system SHALL be deployable on cloud platforms (Vercel for frontend, Render/Railway for backend).
- **NFR-18.2**: The system SHALL use environment variables for configuration (no hardcoded values).
- **NFR-18.3**: The system SHALL support containerization (Docker) if needed for deployment.
- **NFR-18.4**: The system SHALL work with MongoDB Atlas (cloud database) or local MongoDB instances.

### 6.9 Interoperability Requirements

#### NFR-19: API Integration
- **NFR-19.1**: The system SHALL integrate with OpenAI GPT-4 API for plan generation.
- **NFR-19.2**: The system SHALL handle API rate limits and quota management.
- **NFR-19.3**: The system SHALL implement retry logic for failed API requests (exponential backoff).
- **NFR-19.4**: The system SHALL validate API responses before processing.
- **NFR-19.5**: The system SHALL support fallback to alternative AI services if primary service fails.

### 6.10 Legal and Compliance Requirements

#### NFR-20: Data Privacy
- **NFR-20.1**: The system SHALL comply with data protection regulations (GDPR principles: data minimization, user consent, right to deletion).
- **NFR-20.2**: The system SHALL allow users to delete their accounts and all associated data.
- **NFR-20.3**: The system SHALL not share user data with third parties without explicit consent.
- **NFR-20.4**: The system SHALL implement secure data storage and transmission.

---

## 7. System Architecture

### 7.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           React Frontend (TypeScript)                 │  │
│  │  - Dashboard, Plans, Community, Store, Settings      │  │
│  │  - Context API (Auth, Progress, Theme)               │  │
│  │  - LocalStorage for client-side data                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Express.js Backend (Node.js)                  │  │
│  │  - Authentication Routes (/api/auth)                 │  │
│  │  - AI Routes (/api/ai)                               │  │
│  │  - Post Routes (/api/posts)                          │  │
│  │  - Middleware (Auth, Validation, Error Handling)    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│   MongoDB      │  │   OpenAI     │  │   Email        │
│   Atlas        │  │   GPT-4 API  │  │   Service      │
│   Database     │  │              │  │   (Nodemailer)  │
│                │  │              │  │                 │
│  - Users       │  │  - Diet      │  │  - Password     │
│  - Posts       │  │    Plans     │  │    Reset       │
│  - Comments    │  │  - Workout  │  │  - Notifications│
│                │  │    Plans     │  │                 │
│                │  │  - Health    │  │                 │
│                │  │    Recommendations│                │
└────────────────┘  └─────────────┘  └─────────────────┘
```

### 7.2 Component Architecture

#### Frontend Components Structure
```
src/
├── components/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── DashboardContentSimple.tsx
│   │   ├── DashboardLayout.tsx
│   │   ├── WorkoutPlanContent.tsx
│   │   ├── DietPlanContent.tsx
│   │   ├── AIRecommendations.tsx
│   │   ├── CommunityContent.tsx
│   │   ├── StoreContent.tsx
│   │   ├── CartContent.tsx
│   │   ├── PaymentContent.tsx
│   │   ├── ProfileContent.tsx
│   │   └── SettingsContent.tsx
│   ├── AuthRoute.tsx
│   ├── ProtectedRoute.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Onboarding.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── ProgressContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── backendAIService.ts
│   ├── openaiService.ts
│   ├── planRenewalService.ts
│   └── notificationService.ts
└── utils/
    └── api.ts
```

#### Backend Structure
```
backend/
├── config/
│   └── database.js
├── controllers/
│   ├── authController.js
│   └── postController.js
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   └── validation.js
├── models/
│   ├── User.js
│   └── Post.js
├── routes/
│   ├── authRoutes.js
│   ├── aiRoutes.js
│   └── postRoutes.js
├── services/
│   └── openaiService.js
├── utils/
│   ├── asyncHandler.js
│   ├── errorResponse.js
│   ├── sendTokenResponse.js
│   └── emailService.js
└── server.js
```

### 7.3 Data Flow Diagrams

#### Diet Plan Generation Flow
```
User → Frontend → Backend API → OpenAI GPT-4 → Backend → Frontend → LocalStorage → Display
 1. User clicks "Generate Diet Plan"
 2. Frontend constructs prompt with user profile
 3. Frontend sends POST /api/ai/generate-diet-plan
 4. Backend validates authentication
 5. Backend sends prompt to OpenAI API
 6. OpenAI generates JSON diet plan
 7. Backend validates and returns plan
 8. Frontend saves to localStorage
 9. Frontend displays plan with tracking
```

#### Progress Tracking Flow
```
User Action → Frontend Update → ProgressContext → LocalStorage → Dashboard Update
 1. User marks meal/exercise complete
 2. Frontend updates component state
 3. ProgressContext calculates statistics
 4. Data saved to localStorage
 5. Dashboard components re-render with new data
 6. AI recommendations refresh if needed
```

---

## 8. Database Schema

### 8.1 User Collection Schema
```javascript
{
  _id: ObjectId,
  username: String (unique, required, 3-30 chars),
  email: String (unique, required, lowercase, validated),
  password: String (hashed, bcrypt, required, min 6 chars),
  profile: {
    age: Number (13-120),
    gender: String (enum: ['male', 'female', 'other']),
    height: Number (50-300 cm),
    weight: Number (20-500 kg),
    healthConditions: [String] (enum: ['Diabetes', 'PCOS', 'High Blood Pressure', 'None']),
    fitnessGoal: String (enum: ['Muscle Building', 'Fat Burning', 'Weight Gain', 'General Fitness']),
    profileImage: String (base64 or URL)
  },
  isEmailVerified: Boolean (default: false),
  isActive: Boolean (default: true),
  role: String (enum: ['user', 'admin'], default: 'user'),
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date,
  loginAttempts: Number (default: 0),
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email`: Unique index
- `username`: Unique index
- `profile.fitnessGoal`: Index for filtering

**Virtual Fields:**
- `bmi`: Calculated from height and weight

### 8.2 Post Collection Schema
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  caption: String (max 300 chars, trimmed),
  imageUrl: String (required),
  likes: [ObjectId] (ref: 'User'),
  comments: [{
    user: ObjectId (ref: 'User', required),
    text: String (required, max 500 chars, trimmed),
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `user`: Index for user's posts query
- `createdAt`: Index for sorting (descending)

---

## 9. API Documentation

### 9.1 Authentication Endpoints

#### POST /api/auth/register
**Description**: Register a new user account  
**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "Password123"
}
```
**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "data": {
    "_id": "user_id",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

#### POST /api/auth/login
**Description**: Authenticate user and get JWT token  
**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "data": { /* user object */ }
}
```

#### GET /api/auth/me
**Description**: Get current authenticated user profile  
**Headers**: `Authorization: Bearer {token}`  
**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* complete user object */ }
}
```

#### PUT /api/auth/updateprofile
**Description**: Update user profile information  
**Headers**: `Authorization: Bearer {token}`  
**Request Body**:
```json
{
  "age": 25,
  "gender": "male",
  "height": 175,
  "weight": 70,
  "healthConditions": ["None"],
  "fitnessGoal": "Muscle Building"
}
```

#### DELETE /api/auth/deleteaccount
**Description**: Permanently delete user account  
**Headers**: `Authorization: Bearer {token}`  
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Account has been permanently deleted"
}
```

### 9.2 AI Service Endpoints

#### POST /api/ai/generate-diet-plan
**Description**: Generate personalized 7-day diet plan  
**Headers**: `Authorization: Bearer {token}`  
**Request Body**:
```json
{
  "prompt": "Create a personalized 7-day diet plan for a 25-year-old male, 175cm, 70kg, goal: Muscle Building, health conditions: None"
}
```
**Response** (200 OK):
```json
{
  "success": true,
  "message": "Diet plan generated successfully",
  "data": {
    "Monday": {
      "breakfast": { "time": "8:00 AM", "foods": [...], "calories": 400 },
      "lunch": { "time": "12:00 PM", "foods": [...], "calories": 500 },
      "dinner": { "time": "6:00 PM", "foods": [...], "calories": 600 }
    },
    "macros": { "protein": 120, "carbs": 150, "fats": 45 },
    "dailyCalories": 1450,
    "tips": [...]
  }
}
```

#### POST /api/ai/generate-workout-plan
**Description**: Generate personalized 6-day workout plan  
**Headers**: `Authorization: Bearer {token}`  
**Request Body**:
```json
{
  "prompt": "Create a personalized 6-day workout plan for Muscle Building goal..."
}
```
**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "Monday": {
      "exercises": [
        {
          "name": "Bench Press",
          "sets": 4,
          "reps": 8,
          "restTime": "90 seconds",
          "equipment": "Barbell"
        }
      ],
      "duration": "45 minutes",
      "warmup": [...],
      "cooldown": [...]
    }
  }
}
```

### 9.3 Post Endpoints

#### GET /api/posts
**Description**: Get all community posts  
**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* array of post objects */ ]
}
```

#### POST /api/posts
**Description**: Create a new community post  
**Headers**: `Authorization: Bearer {token}`  
**Request**: Multipart form data
- `caption`: String (max 300 chars)
- `image`: File (JPG/PNG, max 10MB)

#### POST /api/posts/:id/like
**Description**: Toggle like on a post  
**Headers**: `Authorization: Bearer {token}`

#### POST /api/posts/:id/comments
**Description**: Add comment to a post  
**Headers**: `Authorization: Bearer {token}`  
**Request Body**:
```json
{
  "text": "Great progress!"
}
```

---

## 10. Technology Stack

### 10.1 Frontend Technologies
- **React 18**: UI library for building component-based interfaces
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite**: Fast build tool and development server
- **React Router v7**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Context API**: State management (no Redux needed)
- **LocalStorage API**: Client-side data persistence

### 10.2 Backend Technologies
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling (ODM)
- **JWT (jsonwebtoken)**: Authentication tokens
- **bcryptjs**: Password hashing
- **express-validator**: Input validation
- **Multer**: File upload handling
- **Nodemailer**: Email sending service
- **Helmet**: Security headers middleware
- **express-rate-limit**: Rate limiting middleware
- **CORS**: Cross-origin resource sharing

### 10.3 AI Integration
- **OpenAI GPT-4 API**: AI model for plan generation
- **Custom Prompt Engineering**: Health and fitness-specific prompts
- **Fallback Service**: Frontend OpenAI service as backup

### 10.4 Deployment
- **Frontend**: Vercel (serverless deployment)
- **Backend**: Render or Railway (cloud hosting)
- **Database**: MongoDB Atlas (cloud database)
- **File Storage**: Local server storage (/uploads directory)

---

## 11. Deployment Architecture

### 11.1 Frontend Deployment (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: 
  - `VITE_API_BASE_URL`: Backend API URL
  - `VITE_OPENAI_API_KEY`: OpenAI API key (optional, for fallback)

### 11.2 Backend Deployment (Render/Railway)
- **Runtime**: Node.js 18+
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret for JWT signing
  - `JWT_EXPIRE`: Token expiration (7d)
  - `OPENAI_API_KEY`: OpenAI API key
  - `EMAIL_FROM`: Email sender address
  - `EMAIL_PASSWORD`: Email service password
  - `FRONTEND_URL`: Frontend URL for CORS

### 11.3 Database (MongoDB Atlas)
- **Cloud Provider**: MongoDB Atlas
- **Backup**: Automated daily backups
- **Replication**: Multi-region replication for availability
- **Security**: IP whitelist, authentication enabled

---

## Conclusion

This documentation provides a comprehensive overview of the Smart Health & Fitness Tracker project, including detailed functional and non-functional requirements, use cases, system architecture, and technical specifications. The project aims to deliver a personalized, AI-powered fitness and health management platform that addresses the needs of diverse user groups while maintaining high standards for security, performance, and user experience.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Author**: Faisal Hanif  
**Project Repository**: [GitHub](https://github.com/FaisalHanif12/Smart-health-Care)

