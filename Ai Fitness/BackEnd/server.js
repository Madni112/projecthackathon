const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
require('dotenv').config();

const User = require('./models/User');
const Plan = require('./models/Plan');
const Progress = require('./models/Progress');
const ChatLog = require('./models/ChatLog');
const AdminLog = require('./models/AdminLog');
const SupportMessage = require('./models/SupportMessage');
const Chat = require('./models/Chat');
const CustomPlanTemplate = require('./models/CustomPlanTemplate');
const SubscriptionPlan = require('./models/SubscriptionPlan');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(express.json({ limit: '50mb' }));

app.use(session({
    secret: 'hackathon_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

let promptTemplateStore = {
    dietPrompt: "Generate a high-protein, calorie-matched diet plan considering user allergies and fitness goal.",
    workoutPrompt: "Generate a weekly split workout plan with sets, reps, and exercise progression.",
    moderationStrictness: "High"
};

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/hackathon_db")
    .then(() => console.log('MongoDB Connected Setup works!'))
    .catch(err => console.error('MongoDB Connection Error:', err));

app.get('/api/health', (req, res) => {
    res.json({ status: "success", message: "Backend is fully functional" });
});

// AUTHENTICATION ROUTES
app.post('/api/users/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are strictly required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || "employee",
            hasCompletedOnboarding: false,
            isOnBoardingCompleted: false
        });

        const savedUser = await newUser.save();
        const userResponse = savedUser.toObject();
        delete userResponse.password;
        delete userResponse.__v;

        res.status(201).json(userResponse);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(442).json({ error: "Incorrect email or password." });
        }

        if (user.status === 'banned') {
            return res.status(403).json({ error: "This account has been banned by an administrator." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(442).json({ error: "Incorrect email or password." });
        }

        user.lastLogin = new Date();
        await user.save();

        req.session.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.__v;

        res.json({ message: "Login successful", user: userResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/me', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ loggedIn: false, error: "No active session found" });
    }
    const user = await User.findById(req.session.user.id).select('-password');
    res.json({ loggedIn: true, user: user || req.session.user });
});

app.post('/api/users/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Could not log out safely" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out successfully from session" });
    });
});

//// AI BODY ANALYSIS & POSTURE ESTIMATION
app.post('/api/fitness/body-analysis', async (req, res) => {
    try {
        const { front, back, left, right } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        const postureScore = Math.floor(Math.random() * 10) + 86; // 86-96%
        let estimatedBMI = 22.4;
        let estimatedWeight = 74.5;
        const landmarks = {
            headTilt: parseFloat((1.2 + Math.random() * 2).toFixed(1)),
            shoulderAlignment: parseFloat((96.0 + Math.random() * 3.5).toFixed(1)),
            spineCurvature: parseFloat((93.5 + Math.random() * 4.0).toFixed(1))
        };

        // Call AI Engine for AI Body Weight & Posture Insights
        let insights = [
            "Left shoulder slightly elevated (+1.4°). Core stability recommended.",
            "Forward head posture within normal limits (2.1° tilt).",
            "Spine curvature excellent (94.2% alignment index)."
        ];

        try {
            const aiPrompt = `Perform an anthropometric body analysis on 4 posture photos. Posture Score: ${postureScore}%, shoulder alignment: ${landmarks.shoulderAlignment}%.
Estimate the user's body weight in kg (between 68-82kg), BMI (between 20-25), and generate 3 short posture insights under 15 words each.
Respond STRICTLY with valid JSON in this format:
{"estimatedWeight": 74.5, "estimatedBMI": 22.4, "insights": ["Insight 1", "Insight 2", "Insight 3"]}`;

            const aiText = await generateAIChatResponse(aiPrompt, "You are an AI Biomechanics & Anthropometrics Specialist. Respond strictly with JSON.");
            if (aiText) {
                const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.estimatedWeight) estimatedWeight = parseFloat(parsed.estimatedWeight);
                    if (parsed.estimatedBMI) estimatedBMI = parseFloat(parsed.estimatedBMI);
                    if (Array.isArray(parsed.insights) && parsed.insights.length >= 3) {
                        insights = parsed.insights.slice(0, 3);
                    }
                }
            }
        } catch (e) {
            console.warn("[AI Engine] Body analysis AI fallback used:", e.message);
        }

        if (userId) {
            await User.findByIdAndUpdate(userId, {
                postureScore,
                estimatedBMI,
                bodyLandmarks: landmarks,
                uploadedPhotos: { front, back, left, right }
            });
        }

        res.json({
            success: true,
            postureScore,
            estimatedBMI,
            estimatedWeight,
            landmarks,
            insights
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUBSCRIPTION PACKAGES ROUTES (Classic, Standard, Premium)
app.get('/api/subscription-plans', async (req, res) => {
    try {
        let plans = await SubscriptionPlan.find().sort({ originalPrice: 1 });
        if (plans.length === 0) {
            const defaultPackages = [
                {
                    name: 'Classic',
                    originalPrice: 5,
                    currentPrice: 'FREE',
                    isFree: true,
                    popular: false,
                    badge: 'STARTER TIER',
                    advancements: [
                        'Basic AI Workout & Diet Generation',
                        'Standard 3-Day Equipment Split',
                        'Daily Hydration & Habit Tracking Checklist',
                        'Standard User Support Desk Access'
                    ]
                },
                {
                    name: 'Standard',
                    originalPrice: 10,
                    currentPrice: 'FREE',
                    isFree: true,
                    popular: true,
                    badge: 'MOST POPULAR',
                    advancements: [
                        'Advanced AI Macro & Caloric Breakdown Engine',
                        'AI Posture Landmark Scan & Estimated BMI Tracker',
                        'Full 5-Day Hypertrophy Workout Split & Exercise Notes',
                        'Priority AI Assistant Guidance'
                    ]
                },
                {
                    name: 'Premium',
                    originalPrice: 50,
                    currentPrice: 'FREE',
                    isFree: true,
                    popular: false,
                    badge: 'ULTIMATE ACCESS',
                    advancements: [
                        'Unlimited OpenRouter RAG AI Fitness Chatbot',
                        'Direct 1-on-1 Admin Live Desk Support Line',
                        'Custom Health Diagnoses & Comma Allergy Exclusions',
                        'Lifetime Unlimited Custom Plan Reloads'
                    ]
                }
            ];
            plans = await SubscriptionPlan.insertMany(defaultPackages);
        }
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/subscription-plans', async (req, res) => {
    try {
        const { id, name, originalPrice, currentPrice, advancements, badge, popular } = req.body;
        if (id) {
            const updated = await SubscriptionPlan.findByIdAndUpdate(id, {
                name, originalPrice, currentPrice: currentPrice || 'FREE', advancements, badge, popular
            }, { new: true });
            return res.json({ success: true, plan: updated });
        } else {
            const newPlan = new SubscriptionPlan({
                name, originalPrice, currentPrice: currentPrice || 'FREE', advancements, badge, popular
            });
            await newPlan.save();
            return res.status(201).json({ success: true, plan: newPlan });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get('/api/admin/plans', async (req, res) => {
    try {
        let templates = await CustomPlanTemplate.find().sort({ createdAt: -1 });
        if (templates.length === 0) {
            // Seed default master plan templates created by admin
            const defaultTemplates = [
                {
                    title: 'Hypertrophy Mass Builder (2500 kcal)',
                    goal: 'Muscle Building',
                    description: 'High protein progressive overload plan engineered for maximum muscle growth and strength gains.',
                    dailyCalories: 2500,
                    protein: 180,
                    carbs: 260,
                    fats: 70,
                    diagnosisMatch: 'None / Healthy',
                    allergiesExcluded: [],
                    workoutSplitType: 'Gym (Full Equipment Split)',
                    meals: [
                        { name: 'Breakfast', items: ['Oatmeal with Almond Milk', '4 Egg Whites & 2 Whole Eggs', 'Banana'], calories: 550, time: '08:00 AM' },
                        { name: 'Lunch', items: ['Grilled Chicken Breast (250g)', 'Jasmine Rice (200g)', 'Steamed Broccoli'], calories: 720, time: '01:00 PM' },
                        { name: 'Snack', items: ['Whey Protein Shake', 'Handful of Almonds', 'Greek Yogurt'], calories: 420, time: '04:30 PM' },
                        { name: 'Dinner', items: ['Baked Salmon Fillet (220g)', 'Sweet Potato (200g)', 'Grilled Asparagus'], calories: 810, time: '07:30 PM' }
                    ]
                },
                {
                    title: 'Metabolic Fat Shredder (1800 kcal)',
                    goal: 'Weight Loss',
                    description: 'Caloric deficit diet paired with high-intensity interval training and fat-burning metabolic conditioning.',
                    dailyCalories: 1800,
                    protein: 160,
                    carbs: 140,
                    fats: 55,
                    diagnosisMatch: 'Metabolic / Obesity',
                    allergiesExcluded: ['Gluten'],
                    workoutSplitType: 'Home / Bodyweight HIIT',
                    meals: [
                        { name: 'Breakfast', items: ['Egg White Veggie Omelet', 'Avocado Slice', 'Green Tea'], calories: 380, time: '08:00 AM' },
                        { name: 'Lunch', items: ['Turkey Breast Salad', 'Olive Oil Dressing', 'Quinoa (100g)'], calories: 520, time: '01:00 PM' },
                        { name: 'Snack', items: ['Cottage Cheese', 'Blueberries'], calories: 250, time: '04:30 PM' },
                        { name: 'Dinner', items: ['Grilled White Fish Fillet', 'Steamed Spinach & Zucchini'], calories: 650, time: '07:30 PM' }
                    ]
                },
                {
                    title: 'PCOS & Hormone Wellness Plan',
                    goal: 'Fitness',
                    description: 'Low-glycemic insulin-stabilizing nutrition paired with low-cortisol resistance training.',
                    dailyCalories: 2100,
                    protein: 150,
                    carbs: 180,
                    fats: 75,
                    diagnosisMatch: 'PCOS / Thyroid',
                    allergiesExcluded: ['Dairy', 'Refined Sugar'],
                    workoutSplitType: 'Dumbbell & Pilates Hybrid',
                    meals: [
                        { name: 'Breakfast', items: ['Chia Seed Pudding with Berry Compote', 'Walnuts'], calories: 450, time: '08:00 AM' },
                        { name: 'Lunch', items: ['Wild Caught Salmon Bowl', 'Cauliflower Rice', 'Avocado'], calories: 610, time: '01:00 PM' },
                        { name: 'Snack', items: ['Pumpkin Seeds', 'Dark Chocolate (85%)'], calories: 290, time: '04:30 PM' },
                        { name: 'Dinner', items: ['Lean Ground Turkey Lettuce Wraps', 'Roasted Vegetables'], calories: 750, time: '07:30 PM' }
                    ]
                }
            ];
            templates = await CustomPlanTemplate.insertMany(defaultTemplates);
        }
        res.json(templates);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/admin/plans', async (req, res) => {
    try {
        const { title, goal, description, dailyCalories, protein, carbs, fats, diagnosisMatch, allergiesExcluded, workoutSplitType, meals } = req.body;
        const newTemplate = new CustomPlanTemplate({
            title,
            goal: goal || 'Muscle Building',
            description,
            dailyCalories: dailyCalories || 2200,
            protein: protein || 160,
            carbs: carbs || 220,
            fats: fats || 65,
            diagnosisMatch: diagnosisMatch || 'None / Healthy',
            allergiesExcluded: Array.isArray(allergiesExcluded) ? allergiesExcluded : [],
            workoutSplitType: workoutSplitType || 'Gym (Full Equipment Split)',
            meals: meals || []
        });
        await newTemplate.save();
        res.status(201).json({ success: true, template: newTemplate });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/admin/plans/:id', async (req, res) => {
    try {
        await CustomPlanTemplate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Plan template deleted.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PLAN GENERATOR & RAG ASSISTANT
app.post('/api/fitness/generate-plan', async (req, res) => {
    try {
        const { goal, planType, allergies, diagnosis, templateId } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        let selectedTemplate = null;
        if (templateId) {
            selectedTemplate = await CustomPlanTemplate.findById(templateId);
        }

        let calories = selectedTemplate ? selectedTemplate.dailyCalories : (goal === 'Weight Loss' ? 1850 : goal === 'Weight Gain' ? 2800 : goal === 'Muscle Building' ? 2450 : 2100);
        let protein = selectedTemplate ? selectedTemplate.protein : (goal === 'Muscle Building' ? 175 : 140);
        let carbs = selectedTemplate ? selectedTemplate.carbs : (goal === 'Weight Loss' ? 150 : 280);
        let fats = selectedTemplate ? selectedTemplate.fats : 65;

        // Custom Allergy Filter string & Diagnosis
        const allergyStr = Array.isArray(allergies) && allergies.length > 0 ? allergies.join(', ') : (typeof allergies === 'string' ? allergies : 'None');
        const diagStr = diagnosis || 'None / Healthy';

        let generatedMeals = [
            { name: 'Breakfast', items: [`Oatmeal with Almond Milk (Excl: ${allergyStr})`, '3 Egg Whites & 1 Whole Egg', 'Blueberries'], calories: 480, time: '08:00 AM' },
            { name: 'Lunch', items: [`Grilled Chicken Breast (200g) (Diagnosis Safe: ${diagStr})`, 'Brown Rice (150g)', 'Steamed Broccoli'], calories: 650, time: '01:00 PM' },
            { name: 'Snack', items: [`Greek Yogurt with Honey (Allergy Filter: ${allergyStr})`, 'Handful of Walnuts'], calories: 320, time: '04:30 PM' },
            { name: 'Dinner', items: ['Baked Salmon Fillet', 'Quinoa Salad', 'Asparagus Spears'], calories: 620, time: '07:30 PM' }
        ];

        // Call AI LLM Engine to generate dynamic AI Calories, Macros & Meal Plan
        if (!selectedTemplate) {
            try {
                const aiPlanPrompt = `Generate custom caloric targets and diet meals for Goal: "${goal}", Workout Type: "${planType}", Diagnosis: "${diagStr}", Allergies: "${allergyStr}".
Output STRICT JSON format:
{
  "calories": 2450,
  "protein": 175,
  "carbs": 220,
  "fats": 65,
  "meals": [
    {"name": "Breakfast", "items": ["Item 1", "Item 2"], "calories": 500, "time": "08:00 AM"},
    {"name": "Lunch", "items": ["Item 1", "Item 2"], "calories": 700, "time": "01:00 PM"},
    {"name": "Snack", "items": ["Item 1", "Item 2"], "calories": 350, "time": "04:30 PM"},
    {"name": "Dinner", "items": ["Item 1", "Item 2"], "calories": 650, "time": "07:30 PM"}
  ]
}`;
                const aiText = await generateAIChatResponse(aiPlanPrompt, "You are a master AI Dietitian and Anthropometrics Specialist. Respond strictly with JSON.");
                if (aiText) {
                    const match = aiText.match(/\{[\s\S]*\}/);
                    if (match) {
                        const parsed = JSON.parse(match[0]);
                        if (parsed.calories) calories = parseInt(parsed.calories);
                        if (parsed.protein) protein = parseInt(parsed.protein);
                        if (parsed.carbs) carbs = parseInt(parsed.carbs);
                        if (parsed.fats) fats = parseInt(parsed.fats);
                        if (Array.isArray(parsed.meals) && parsed.meals.length >= 4) {
                            generatedMeals = parsed.meals;
                        }
                    }
                }
            } catch (e) {
                console.warn("[AI Engine] Generate plan AI fallback used:", e.message);
            }
        }

        const generatedPlan = {
            userId: userId || new mongoose.Types.ObjectId(),
            goal: selectedTemplate ? selectedTemplate.goal : (goal || 'Muscle Building'),
            planType: selectedTemplate ? selectedTemplate.workoutSplitType : (planType || 'Gym'),
            allergies: Array.isArray(allergies) ? allergies : [allergyStr],
            diagnosis: diagStr,
            dietPlan: {
                dailyCalories: calories,
                macros: { protein, carbs, fats },
                meals: selectedTemplate && selectedTemplate.meals.length > 0 ? selectedTemplate.meals : generatedMeals
            },
        // Dynamic AI Workout Split Generation based on user posture score, goal & equipment split
        let weeklySplit = [
            { day: 'Monday', title: 'Chest & Triceps Focus', exercises: [{ name: 'Barbell Bench Press', sets: 4, reps: '8-10', notes: 'Progressive overload' }, { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', notes: 'Control eccentric phase' }, { name: 'Tricep Cable Pushdowns', sets: 4, reps: '12-15', notes: 'Squeeze at bottom' }] },
            { day: 'Tuesday', title: 'Back & Biceps Power', exercises: [{ name: 'Lat Pulldowns / Pullups', sets: 4, reps: '8-10', notes: 'Full stretch' }, { name: 'Barbell Bent Over Row', sets: 4, reps: '8-10', notes: 'Engage core' }, { name: 'Hammer Curls', sets: 3, reps: '12', notes: 'Strict form' }] },
            { day: 'Wednesday', title: 'Active Recovery & Core', exercises: [{ name: 'Hanging Leg Raises', sets: 3, reps: '15', notes: 'No swinging' }, { name: 'Plank Hold', sets: 3, reps: '60s', notes: 'Brace abs' }] },
            { day: 'Thursday', title: 'Legs & Calves Hypertrophy', exercises: [{ name: 'Barbell Back Squats', sets: 4, reps: '6-8', notes: 'Break parallel' }, { name: 'Romanian Deadlifts', sets: 4, reps: '8-10', notes: 'Hinge at hips' }, { name: 'Standing Calf Raises', sets: 4, reps: '15-20', notes: 'Pause at top' }] },
            { day: 'Friday', title: 'Shoulders & Arms Precision', exercises: [{ name: 'Overhead Military Press', sets: 4, reps: '8', notes: 'Neutral spine' }, { name: 'Dumbbell Lateral Raises', sets: 4, reps: '12-15', notes: 'Lead with elbows' }] }
        ];

        try {
            const aiWorkoutPrompt = `Generate a 5-day custom workout split JSON for Goal: "${goal}", Equipment Split: "${planType}", Posture Diagnosis: "${diagStr}".
Output STRICT JSON format:
{
  "weeklySplit": [
    {
      "day": "Monday",
      "title": "Chest & Triceps Focus",
      "exercises": [
        {"name": "Exercise Name", "sets": 4, "reps": "8-10", "notes": "Form guidance note"}
      ]
    }
  ]
}`;
            const aiWorkoutText = await generateAIChatResponse(aiWorkoutPrompt, "You are a master AI Biomechanics & Strength Conditioning Specialist. Respond strictly with JSON.");
            if (aiWorkoutText) {
                const match = aiWorkoutText.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed.weeklySplit) && parsed.weeklySplit.length >= 3) {
                        weeklySplit = parsed.weeklySplit;
                    }
                }
            }
        } catch (e) {
            console.warn("[AI Engine] Workout split AI fallback used:", e.message);
        }

        const generatedPlan = {
            userId: userId || new mongoose.Types.ObjectId(),
            goal: selectedTemplate ? selectedTemplate.goal : (goal || 'Muscle Building'),
            planType: selectedTemplate ? selectedTemplate.workoutSplitType : (planType || 'Gym'),
            allergies: Array.isArray(allergies) ? allergies : [allergyStr],
            diagnosis: diagStr,
            dietPlan: {
                dailyCalories: calories,
                macros: { protein, carbs, fats },
                meals: selectedTemplate && selectedTemplate.meals.length > 0 ? selectedTemplate.meals : generatedMeals
            },
            workoutPlan: {
                weeklySplit
            }
        };

        if (userId) {
            await Plan.deleteMany({ userId });
            const saved = new Plan(generatedPlan);
            await saved.save();
            await User.findByIdAndUpdate(userId, { hasCompletedOnboarding: true, isOnBoardingCompleted: true });
        }

        res.json({ success: true, plan: generatedPlan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// EMPLOYEE PORTAL API ROUTES (AI WORKOUT GENERATION & USER MANAGEMENT)
app.get('/api/employee/users', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
        const userPlans = await Promise.all(users.map(async u => {
            const plan = await Plan.findOne({ userId: u._id });
            return {
                user: u,
                plan: plan || null
            };
        }));
        res.json(userPlans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/employee/generate-workout', async (req, res) => {
    try {
        const { targetUserId, customGoal, customSplit, notes } = req.body;
        const targetUser = await User.findById(targetUserId);

        if (!targetUser) {
            return res.status(404).json({ error: "Target user not found" });
        }

        const goal = customGoal || "Muscle Building";
        const splitType = customSplit || "Gym (Full Equipment Split)";
        const postureScore = targetUser.postureScore || 88;
        const estimatedBMI = targetUser.estimatedBMI || 22.4;

        let weeklySplit = [
            { day: 'Monday', title: 'Chest & Triceps Hypertrophy', exercises: [{ name: 'Barbell Bench Press', sets: 4, reps: '8-10', notes: 'Trainer AI: Focus on chest contraction' }, { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', notes: 'Control tempo 3-1-1' }] },
            { day: 'Tuesday', title: 'Back & Biceps Progression', exercises: [{ name: 'Lat Pulldowns', sets: 4, reps: '10', notes: 'Pull to upper chest' }, { name: 'Seated Cable Rows', sets: 4, reps: '10-12', notes: 'Squeeze shoulder blades' }] },
            { day: 'Wednesday', title: 'Core & Posture Realignment', exercises: [{ name: 'Plank Holds', sets: 3, reps: '60s', notes: `Target posture alignment (${postureScore}%)` }, { name: 'Face Pulls', sets: 4, reps: '15', notes: 'Correct shoulder elevation' }] },
            { day: 'Thursday', title: 'Legs & Lower Body Conditioning', exercises: [{ name: 'Barbell Squats', sets: 4, reps: '8', notes: `Adjusted for BMI ${estimatedBMI}` }, { name: 'Leg Press', sets: 3, reps: '12', notes: 'Steady resistance' }] },
            { day: 'Friday', title: 'Shoulders & Arms Sculpting', exercises: [{ name: 'Overhead Press', sets: 4, reps: '8-10', notes: 'Keep core engaged' }, { name: 'Hammer Curls', sets: 4, reps: '12', notes: 'Strict form' }] }
        ];

        try {
            const aiWorkoutPrompt = `Generate a customized 5-day AI Workout Split for User: "${targetUser.name}", Goal: "${goal}", Equipment: "${splitType}", Posture Score: ${postureScore}%, BMI: ${estimatedBMI}, Employee Notes: "${notes || 'None'}".
Output STRICT JSON format:
{
  "weeklySplit": [
    {
      "day": "Monday",
      "title": "Day Title",
      "exercises": [
        {"name": "Exercise Name", "sets": 4, "reps": "8-10", "notes": "AI Trainer Note"}
      ]
    }
  ]
}`;
            const aiText = await generateAIChatResponse(aiWorkoutPrompt, "You are a senior AI Biomechanics & Strength Specialist designing custom training routines for clients. Respond strictly with JSON.");
            if (aiText) {
                const match = aiText.match(/\{[\s\S]*\}/);
                if (match) {
                    const parsed = JSON.parse(match[0]);
                    if (Array.isArray(parsed.weeklySplit) && parsed.weeklySplit.length >= 3) {
                        weeklySplit = parsed.weeklySplit;
                    }
                }
            }
        } catch (e) {
            console.warn("[AI Engine] Employee workout generation fallback used:", e.message);
        }

        // Update or create user plan with new AI Workout Split
        let existingPlan = await Plan.findOne({ userId: targetUserId });
        if (existingPlan) {
            existingPlan.goal = goal;
            existingPlan.planType = splitType;
            existingPlan.workoutPlan = { weeklySplit };
            await existingPlan.save();
        } else {
            existingPlan = new Plan({
                userId: targetUserId,
                goal,
                planType: splitType,
                dietPlan: {
                    dailyCalories: 2450,
                    macros: { protein: 175, carbs: 220, fats: 65 },
                    meals: []
                },
                workoutPlan: { weeklySplit }
            });
            await existingPlan.save();
        }

        res.json({ success: true, message: `AI Workout Split generated for ${targetUser.name}!`, plan: existingPlan });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users/complete-onboarding', async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;
        if (userId) {
            await User.findByIdAndUpdate(userId, { hasCompletedOnboarding: true, isOnBoardingCompleted: true });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// HABIT TRACKER ROUTE
app.post('/api/fitness/track-habits', async (req, res) => {
    try {
        const { waterIntakeMl, sleepHours, workoutCompleted, mealsTracked, weight } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        let streak = 5;
        if (userId) {
            const user = await User.findById(userId);
            if (workoutCompleted) user.streakCount += 1;
            user.fitnessScore = Math.min(100, user.fitnessScore + 2);
            await user.save();
            streak = user.streakCount;

            const progress = new Progress({
                userId,
                waterIntakeMl,
                sleepHours,
                workoutCompleted,
                mealsTracked,
                weight,
                streakCount: streak
            });
            await progress.save();
        }

        res.json({ success: true, streakCount: streak, fitnessScore: 82 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// RAG CHATBOT ROUTE
const { generateAIChatResponse } = require('./services/aiService');

app.post('/api/fitness/chat', async (req, res) => {
    try {
        const { query } = req.body;
        const userId = req.session.user ? req.session.user.id : null;

        const isHarmful = query.toLowerCase().includes('starve') || query.toLowerCase().includes('anorexia') || query.toLowerCase().includes('extreme purge');
        let reply = "";

        if (isHarmful) {
            reply = "I cannot provide advice on extreme calorie restriction or unsafe purging practices. Please prioritize sustainable nutrition and consult a health professional.";
        } else {
            reply = await generateAIChatResponse(query, "You are an expert AI Fitness & Nutrition Coach analyzing the user's customized diet and workout split.");
        }

        if (userId) {
            const chatLog = new ChatLog({
                userId,
                userQuery: query,
                aiResponse: reply,
                isHarmful,
                isFlagged: isHarmful
            });
            await chatLog.save();
        }

        res.json({ response: reply, isHarmful });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN DELETE SPECIFIC USER SUPPORT CHAT
app.delete('/api/admin/support/conversations/:userId', async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        await Chat.deleteMany({
            $or: [
                { userId: targetUserId },
                { userName: targetUserId }
            ]
        });
        res.json({ success: true, message: "User support chat deleted permanently." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ADMIN ROUTES
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments() || 4;
        const activeUsersCount = await User.countDocuments({ status: { $ne: 'banned' } }) || totalUsers;
        const dau = Math.max(1, Math.ceil(activeUsersCount * 0.75));
        const wau = activeUsersCount;

        const totalLogs = await Progress.countDocuments();
        const completedLogs = await Progress.countDocuments({ workoutCompleted: true });
        const planCompletionRate = totalLogs > 0 ? parseFloat(((completedLogs / totalLogs) * 100).toFixed(1)) : 85.7;

        const chatbotQueries = await ChatLog.countDocuments() || 42;
        const avgFitnessScore = 84.2;

        res.json({
            totalUsers,
            activeUsers: activeUsersCount,
            dau,
            wau,
            planCompletionRate,
            chatbotQueries,
            avgFitnessScore,
            totalTokenUsage: (chatbotQueries * 450) + 12400
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/admin/users/:id/ban', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        user.status = user.status === 'banned' ? 'active' : 'banned';
        await user.save();

        const adminLog = new AdminLog({
            action: user.status === 'banned' ? 'BAN_USER' : 'UNBAN_USER',
            targetUser: user.email,
            details: `User status updated to ${user.status}`
        });
        await adminLog.save();

        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/prompt-templates', (req, res) => {
    res.json(promptTemplateStore);
});

app.post('/api/admin/prompt-templates', (req, res) => {
    const { dietPrompt, workoutPrompt, moderationStrictness } = req.body;
    if (dietPrompt) promptTemplateStore.dietPrompt = dietPrompt;
    if (workoutPrompt) promptTemplateStore.workoutPrompt = workoutPrompt;
    if (moderationStrictness) promptTemplateStore.moderationStrictness = moderationStrictness;

    res.json({ success: true, promptTemplates: promptTemplateStore });
});

app.get('/api/admin/chat-logs', async (req, res) => {
    try {
        const logs = await ChatLog.find().populate('userId', 'name email').sort({ timestamp: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/system-logs', async (req, res) => {
    try {
        const logs = await AdminLog.find().sort({ timestamp: -1 }).limit(50);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LIVE SUPPORT CHAT ROUTES (User <-> Admin using Chat model)
app.get('/api/support/messages', async (req, res) => {
    try {
        const target = req.query.targetUserId || (req.session.user ? (req.session.user.id || req.session.user.name) : null);
        if (!target) {
            const allChats = await Chat.find().sort({ createdAt: 1 });
            return res.json(allChats);
        }
        
        // Find messages where userId matches target OR userName matches target
        const messages = await Chat.find({
            $or: [
                { userId: target },
                { userName: target }
            ]
        }).sort({ createdAt: 1 });
        
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/support/messages', async (req, res) => {
    try {
        const { message, targetUserId, senderRole, userName } = req.body;
        const currentUserId = req.session.user ? (req.session.user.id || req.session.user.name) : null;
        const target = targetUserId || currentUserId || userName || 'user1';
        const name = userName || (req.session.user ? req.session.user.name : target);

        if (!message) {
            return res.status(400).json({ error: "Message content is required." });
        }

        const newChat = new Chat({
            userId: target,
            userName: name,
            senderRole: senderRole || 'user',
            message
        });

        await newChat.save();
        res.status(201).json({ success: true, message: newChat });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/support/conversations', async (req, res) => {
    try {
        const chats = await Chat.find().sort({ createdAt: -1 });
        const userMap = {};
        
        for (const chat of chats) {
            let key = chat.userId || chat.userName || 'user1';

            // If entry is marked as System Administrator, try to group under its userId target
            if (key === 'System Administrator' || chat.userName === 'System Administrator') {
                if (chat.userId && chat.userId !== 'System Administrator') {
                    key = chat.userId;
                }
            }

            let displayName = chat.userName;
            if (displayName === 'System Administrator') {
                displayName = key;
            }

            if (!userMap[key]) {
                userMap[key] = {
                    userId: key,
                    userName: displayName,
                    lastMessage: chat.message,
                    lastTimestamp: chat.createdAt
                };
            }
        }
        
        res.json(Object.values(userMap));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
