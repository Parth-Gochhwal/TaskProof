"""
Database seed script.
Run with: python -m app.db.seed (from backend/ directory)

Deterministic — will not duplicate records on re-run.
Seeds demo users, profiles, tasks, submissions, wallets, proofs.
"""

import sys
import os

# Ensure backend/ is on the path when run as a module
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.db.database import engine, init_db, SessionLocal
from app.db.models import (
    User, ContributorProfile, BusinessProfile,
    Task, Submission, Wallet, Transaction, RewardProof
)


def _dt(s: str) -> datetime:
    """Parse ISO datetime string to timezone-aware datetime."""
    dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def seed(db: Session) -> None:
    # ============================
    # Demo Users
    # ============================
    existing_contrib = db.query(User).filter(User.id == "user-contributor-demo").first()
    if existing_contrib:
        print("Seed data already exists. Skipping.")
        return

    print("Seeding database...")

    # Contributor User
    contrib_user = User(
        id="user-contributor-demo",
        email="parth@taskproof.dev",
        name="Parth Sharma",
        role="contributor",
        avatar=None,
        created_at=_dt("2026-07-15T10:00:00Z"),
    )
    db.add(contrib_user)

    # Business User
    biz_user = User(
        id="user-business-demo",
        email="admin@techcorp.com",
        name="TechCorp Admin",
        role="business",
        avatar=None,
        created_at=_dt("2026-06-01T09:00:00Z"),
    )
    db.add(biz_user)

    # Additional contributor users for leaderboard
    other_contribs = [
        ("lb-user-1", "vikram@example.com", "Vikram Rao"),
        ("lb-user-2", "shreya@example.com", "Shreya Nair"),
        ("lb-user-3", "ankit@example.com", "Ankit Joshi"),
        ("lb-user-4", "aanya@example.com", "Aanya Kapoor"),
        ("lb-user-5", "rohit@example.com", "Rohit Mehta"),
    ]
    for uid, email, name in other_contribs:
        u = User(id=uid, email=email, name=name, role="contributor",
                 created_at=_dt("2026-07-01T00:00:00Z"))
        db.add(u)

    db.flush()

    # ============================
    # Contributor Profile
    # ============================
    contrib_profile = ContributorProfile(
        user_id="user-contributor-demo",
        username="parth_s",
        bio="Computer Science student passionate about AI and data science.",
        college="IIT Bombay",
        skills=["Data Labeling", "AI Evaluation", "Research", "Content Review", "Testing"],
        level=4,
        level_name="Data Explorer",
        xp=2340,
        xp_to_next_level=3000,
        streak=5,
        tasks_completed=48,
        quality_score=96.0,
        rating=4.8,
        total_earned=1250,
        wallet_address="0xA3f8...3D2c",
        badges=[
            {"id": "b1", "name": "First Task", "description": "Completed your first task", "icon": "Star", "earnedAt": "2026-07-16T12:00:00Z", "rarity": "common"},
            {"id": "b2", "name": "7 Day Streak", "description": "7 consecutive days of tasks", "icon": "Flame", "earnedAt": "2026-07-25T12:00:00Z", "rarity": "uncommon"},
            {"id": "b3", "name": "Top Contributor", "description": "Ranked in top 10 this week", "icon": "Trophy", "earnedAt": "2026-08-10T12:00:00Z", "rarity": "rare"},
            {"id": "b4", "name": "Explorer", "description": "Completed tasks in 3+ categories", "icon": "Compass", "earnedAt": "2026-08-20T12:00:00Z", "rarity": "uncommon"},
            {"id": "b5", "name": "Verified Pro", "description": "95%+ quality score over 30 tasks", "icon": "ShieldCheck", "earnedAt": "2026-09-01T12:00:00Z", "rarity": "rare"},
        ],
        joined_at=_dt("2026-07-15T10:00:00Z"),
    )
    db.add(contrib_profile)

    # Leaderboard contributor profiles
    lb_profiles = [
        ("lb-user-1", "vikram_r", 5, "Verified Specialist", 4500, 9999, 127, 99.0, 4.9, 5840),
        ("lb-user-2", "shreya_n", 5, "Verified Specialist", 3800, 9999, 112, 98.0, 4.8, 5120),
        ("lb-user-3", "ankit_j", 4, "Data Explorer", 2200, 3000, 96, 97.0, 4.7, 4200),
        ("lb-user-4", "aanya_k", 3, "Task Explorer", 900, 1200, 41, 95.0, 4.5, 1100),
        ("lb-user-5", "rohit_m", 3, "Task Explorer", 1100, 1200, 38, 94.0, 4.4, 980),
    ]
    for uid, username, level, level_name, xp, xp_next, tasks, qs, rating, earned in lb_profiles:
        p = ContributorProfile(
            user_id=uid,
            username=username,
            level=level,
            level_name=level_name,
            xp=xp,
            xp_to_next_level=xp_next,
            tasks_completed=tasks,
            quality_score=qs,
            rating=rating,
            total_earned=earned,
            wallet_address=f"0x{uid[-4:]}...demo",
            skills=[],
            badges=[],
            joined_at=_dt("2026-07-01T00:00:00Z"),
        )
        db.add(p)

    # ============================
    # Business Profile
    # ============================
    biz_profile = BusinessProfile(
        user_id="user-business-demo",
        company_name="TechCorp",
        industry="Technology / AI",
        website="https://techcorp.example.com",
        tasks_created=8,
        total_spent=8450,
        approval_rate=87.0,
        joined_at=_dt("2026-06-01T09:00:00Z"),
    )
    db.add(biz_profile)
    db.flush()

    # ============================
    # Tasks
    # ============================
    tasks_data = [
        {
            "id": "task-001",
            "title": "Product Image Categorization",
            "category": "data-labeling",
            "short_description": "Categorize product images into the correct e-commerce categories.",
            "description": "You will be shown 10 product images from our e-commerce dataset. Assign the correct top-level category and sub-category to each product. Accurate labeling helps train our recommendation engine.",
            "reward": 50, "estimated_minutes": 12, "difficulty": "easy",
            "slots": 200, "remaining_slots": 124, "quality_score": 98.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["images", "e-commerce", "labeling"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Select one primary category per image."},
                {"id": "r2", "type": "instruction", "description": "Use 'Unknown' only if the product cannot be identified."},
                {"id": "r3", "type": "instruction", "description": "Complete all 10 images before submitting."},
                {"id": "r4", "type": "acceptance_criteria", "description": "At least 9/10 categories must match the gold standard."},
                {"id": "r5", "type": "acceptance_criteria", "description": "No blank or placeholder entries accepted."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Product Category", "type": "select", "options": ["Electronics", "Footwear", "Clothing", "Home & Garden", "Toys", "Books", "Food & Beverage", "Beauty", "Sports", "Unknown"], "required": True},
                {"id": "f2", "label": "Confidence Level", "type": "radio", "options": ["High", "Medium", "Low"], "required": True},
                {"id": "f3", "label": "Notes (optional)", "type": "textarea", "required": False, "placeholder": "Any observations..."},
            ],
            "created_at": _dt("2026-09-20T09:00:00Z"),
        },
        {
            "id": "task-002",
            "title": "AI Response Evaluation",
            "category": "ai-evaluation",
            "short_description": "Rate AI-generated responses for quality, accuracy, and helpfulness.",
            "description": "Evaluate responses generated by an AI assistant. You will see a question and two AI-generated answers. Rate each answer on accuracy, helpfulness, and tone.",
            "reward": 35, "estimated_minutes": 7, "difficulty": "medium",
            "slots": 500, "remaining_slots": 312, "quality_score": 95.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["AI", "evaluation", "NLP"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Read both AI responses carefully before rating."},
                {"id": "r2", "type": "acceptance_criteria", "description": "All rating fields must be filled."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Better Response", "type": "radio", "options": ["Response A", "Response B", "Both Equal", "Both Poor"], "required": True},
                {"id": "f2", "label": "Accuracy (1-5)", "type": "rating", "options": ["1", "2", "3", "4", "5"], "required": True},
                {"id": "f3", "label": "Helpfulness (1-5)", "type": "rating", "options": ["1", "2", "3", "4", "5"], "required": True},
                {"id": "f4", "label": "Tone (1-5)", "type": "rating", "options": ["1", "2", "3", "4", "5"], "required": True},
                {"id": "f5", "label": "Brief Justification", "type": "textarea", "required": False, "placeholder": "Why did you choose this rating?"},
            ],
            "created_at": _dt("2026-09-22T11:00:00Z"),
        },
        {
            "id": "task-003",
            "title": "Website UX Testing",
            "category": "testing",
            "short_description": "Test a web app and report usability issues with structured feedback.",
            "description": "Perform structured usability testing on our new dashboard product. Follow the test script to complete 5 specific user flows and document any friction, confusion, or broken interactions you encounter.",
            "reward": 70, "estimated_minutes": 18, "difficulty": "medium",
            "slots": 80, "remaining_slots": 43, "quality_score": 97.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["UX", "testing", "usability"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Use Chrome or Firefox (latest version)."},
                {"id": "r2", "type": "acceptance_criteria", "description": "Each flow report must have at least one observation."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Overall Usability (1-10)", "type": "rating", "options": ["1","2","3","4","5","6","7","8","9","10"], "required": True},
                {"id": "f2", "label": "Navigation Issues Found", "type": "textarea", "required": True, "placeholder": "Describe any navigation problems..."},
                {"id": "f3", "label": "Broken or Confusing UI Elements", "type": "textarea", "required": True, "placeholder": "Describe specific UI issues..."},
                {"id": "f4", "label": "Task Completion", "type": "radio", "options": ["All 5 flows completed", "4 flows completed", "3 or fewer flows completed"], "required": True},
            ],
            "created_at": _dt("2026-09-25T14:00:00Z"),
        },
        {
            "id": "task-004",
            "title": "Survey on Student Tech Habits",
            "category": "survey",
            "short_description": "Share your experience with digital tools as a student.",
            "description": "Participate in a structured research survey on how students use digital tools for studying, collaboration, and career building.",
            "reward": 20, "estimated_minutes": 5, "difficulty": "easy",
            "slots": 1000, "remaining_slots": 687, "quality_score": 99.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["survey", "education", "research"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Must be a current student or recent graduate (last 2 years)."},
                {"id": "r2", "type": "acceptance_criteria", "description": "Text answers must be at least 2 sentences."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Primary Learning Tool", "type": "select", "options": ["YouTube", "Coursera/MOOC", "University LMS", "Textbooks", "Peer study groups", "Other"], "required": True},
                {"id": "f2", "label": "Hours per week spent on digital learning", "type": "radio", "options": ["0-2 hours", "3-5 hours", "6-10 hours", "10+ hours"], "required": True},
                {"id": "f3", "label": "Biggest challenge with online learning", "type": "textarea", "required": True, "placeholder": "Describe in 2+ sentences..."},
                {"id": "f4", "label": "Tools you wish existed", "type": "textarea", "required": False, "placeholder": "Optional..."},
            ],
            "created_at": _dt("2026-09-28T08:00:00Z"),
        },
        {
            "id": "task-005",
            "title": "Product Description Review",
            "category": "content-review",
            "short_description": "Review AI-generated product descriptions for quality and accuracy.",
            "description": "Review 5 AI-generated product descriptions and rate them for accuracy, readability, and brand voice.",
            "reward": 40, "estimated_minutes": 10, "difficulty": "easy",
            "slots": 150, "remaining_slots": 89, "quality_score": 96.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["content", "review", "writing"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Read each description fully before rating."},
                {"id": "r2", "type": "acceptance_criteria", "description": "At least 3 descriptions must have a written comment."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Quality Rating (1-5)", "type": "rating", "options": ["1","2","3","4","5"], "required": True},
                {"id": "f2", "label": "Issues Found", "type": "checkbox", "options": ["Factual error", "Grammar issue", "Tone mismatch", "Misleading claim", "None"], "required": True},
                {"id": "f3", "label": "Improvement Suggestion", "type": "textarea", "required": False, "placeholder": "How could this description be improved?"},
            ],
            "created_at": _dt("2026-09-30T10:00:00Z"),
        },
        {
            "id": "task-006",
            "title": "Research Data Collection",
            "category": "research",
            "short_description": "Collect structured market data from public sources.",
            "description": "Research and document pricing data for 10 specified software products from their public pricing pages.",
            "reward": 60, "estimated_minutes": 15, "difficulty": "medium",
            "slots": 60, "remaining_slots": 28, "quality_score": 94.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["research", "market data", "pricing"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Only use official company websites as sources."},
                {"id": "r2", "type": "acceptance_criteria", "description": "All 10 products must be documented."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Product Name", "type": "text", "required": True, "placeholder": "e.g. Notion"},
                {"id": "f2", "label": "Plan & Price", "type": "textarea", "required": True, "placeholder": "e.g. Pro: $16/month..."},
                {"id": "f3", "label": "Data Source URL", "type": "text", "required": True, "placeholder": "https://..."},
            ],
            "created_at": _dt("2026-10-01T13:00:00Z"),
        },
        {
            "id": "task-007",
            "title": "App Onboarding Flow Testing",
            "category": "testing",
            "short_description": "Test the onboarding experience of a mobile app and report friction.",
            "description": "Download and run through the onboarding flow of our new mobile productivity app.",
            "reward": 80, "estimated_minutes": 20, "difficulty": "hard",
            "slots": 40, "remaining_slots": 15, "quality_score": 98.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["testing", "mobile", "onboarding"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Use an Android device (Android 10 or higher)."},
                {"id": "r2", "type": "acceptance_criteria", "description": "Must complete at least 3 onboarding steps."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Steps Completed", "type": "radio", "options": ["All steps", "5+ steps", "3-4 steps", "Fewer than 3 steps"], "required": True},
                {"id": "f2", "label": "Friction Points", "type": "textarea", "required": True, "placeholder": "Where did you feel confused or frustrated?"},
                {"id": "f3", "label": "Overall Rating (1-5)", "type": "rating", "options": ["1","2","3","4","5"], "required": True},
            ],
            "created_at": _dt("2026-10-02T09:30:00Z"),
        },
        {
            "id": "task-008",
            "title": "Receipt Classification",
            "category": "data-labeling",
            "short_description": "Classify digital receipts into expense categories.",
            "description": "You will be shown images of digital receipts and invoices. Classify each into the correct expense category.",
            "reward": 45, "estimated_minutes": 10, "difficulty": "easy",
            "slots": 300, "remaining_slots": 201, "quality_score": 97.0,
            "business_id": "user-business-demo", "business_name": "TechCorp",
            "tags": ["finance", "classification", "receipts"],
            "requirements": [
                {"id": "r1", "type": "instruction", "description": "Select the most specific category available."},
                {"id": "r2", "type": "acceptance_criteria", "description": "9/10 must match the expected category."},
            ],
            "input_fields": [
                {"id": "f1", "label": "Expense Category", "type": "select", "options": ["Travel", "Meals & Entertainment", "Office Supplies", "Software/SaaS", "Hardware", "Utilities", "Marketing", "Professional Services", "Other"], "required": True},
                {"id": "f2", "label": "Confidence", "type": "radio", "options": ["High", "Medium", "Low"], "required": True},
            ],
            "created_at": _dt("2026-10-03T11:00:00Z"),
        },
    ]

    for td in tasks_data:
        task = Task(
            id=td["id"],
            title=td["title"],
            category=td["category"],
            description=td["description"],
            short_description=td["short_description"],
            reward=td["reward"],
            estimated_minutes=td["estimated_minutes"],
            difficulty=td["difficulty"],
            slots=td["slots"],
            remaining_slots=td["remaining_slots"],
            quality_score=td["quality_score"],
            status="active",
            business_id=td["business_id"],
            business_name=td["business_name"],
            tags=td["tags"],
            requirements=td["requirements"],
            input_fields=td["input_fields"],
            created_at=td["created_at"],
        )
        db.add(task)

    db.flush()

    # ============================
    # Wallets
    # ============================
    contrib_wallet = Wallet(
        user_id="user-contributor-demo",
        balance=1250,
        reserved=0,
        total_earned=1380,
        total_spent=130,
        address="0xA3f8b2C1e4D5...3D2c",
    )
    db.add(contrib_wallet)

    biz_wallet = Wallet(
        user_id="user-business-demo",
        balance=6550,
        reserved=2400,
        total_earned=0,
        total_spent=8450,
        address="0xB7c9...F4a1",
    )
    db.add(biz_wallet)

    db.flush()

    # ============================
    # Seed Transactions (historical)
    # ============================
    contrib_tx_data = [
        ("tx-001", "task_reward", 50, "credit", "Task Reward", "task-001", "Product Image Categorization", "sub-001", "0x7f3a...9b12", _dt("2026-09-21T15:30:00Z")),
        ("tx-002", "task_reward", 20, "credit", "Task Reward", "task-004", "Survey on Student Tech Habits", "sub-002", "0x2c8d...4f91", _dt("2026-09-29T10:15:00Z")),
        ("tx-003", "task_reward", 70, "credit", "Task Reward", "task-003", "Website UX Testing", None, "0xa1b2...c3d4", _dt("2026-09-18T16:00:00Z")),
        ("tx-004", "task_reward", 35, "credit", "Task Reward", "task-002", "AI Response Evaluation", None, "0xe5f6...a7b8", _dt("2026-09-15T14:00:00Z")),
        ("tx-005", "task_reward", 40, "credit", "Task Reward", None, "Content Quality Review", None, "0xc9d0...e1f2", _dt("2026-09-10T11:00:00Z")),
    ]

    for tx_id, tx_type, amount, direction, label, task_id, task_title, sub_id, proof_hash, ts in contrib_tx_data:
        tx = Transaction(
            id=tx_id,
            wallet_id=contrib_wallet.id,
            type=tx_type,
            amount=amount,
            direction=direction,
            label=label,
            task_id=task_id,
            task_title=task_title,
            submission_id=sub_id,
            status="confirmed",
            proof_hash=proof_hash,
            network="TaskProof Local Network",
            timestamp=ts,
        )
        db.add(tx)

    # Business transactions
    biz_tx1 = Transaction(
        id="btx-001",
        wallet_id=biz_wallet.id,
        type="task_funding",
        amount=5000,
        direction="debit",
        label="Task Budget Funded",
        task_id="task-001",
        task_title="Product Image Categorization",
        status="confirmed",
        network="TaskProof Local Network",
        timestamp=_dt("2026-09-20T09:00:00Z"),
    )
    db.add(biz_tx1)

    biz_tx2 = Transaction(
        id="btx-002",
        wallet_id=biz_wallet.id,
        type="task_reward",
        amount=50,
        direction="debit",
        label="Reward Released",
        task_id="task-001",
        task_title="Product Image Categorization",
        submission_id="sub-001",
        status="confirmed",
        proof_hash="0x7f3a...9b12",
        network="TaskProof Local Network",
        timestamp=_dt("2026-09-21T15:30:00Z"),
    )
    db.add(biz_tx2)
    db.flush()

    # ============================
    # Submissions
    # ============================
    submissions_data = [
        {
            "id": "sub-001",
            "task_id": "task-001",
            "task_title": "Product Image Categorization",
            "contributor_id": "user-contributor-demo",
            "contributor_name": "Parth Sharma",
            "contributor_level": 4,
            "data": {"f1": "Electronics", "f2": "High", "f3": "Clear product shot."},
            "status": "rewarded",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": True},
            ],
            "review_reviewer_id": "user-business-demo",
            "review_status": "approved",
            "review_feedback": "Excellent accuracy.",
            "reviewed_at": _dt("2026-09-21T15:00:00Z"),
            "reward": 50,
            "transaction_id": "tx-001",
            "submitted_at": _dt("2026-09-21T12:00:00Z"),
        },
        {
            "id": "sub-002",
            "task_id": "task-004",
            "task_title": "Survey on Student Tech Habits",
            "contributor_id": "user-contributor-demo",
            "contributor_name": "Parth Sharma",
            "contributor_level": 4,
            "data": {"f1": "YouTube", "f2": "6-10 hours", "f3": "Keeping focus and avoiding distractions remains my biggest challenge with online learning.", "f4": "An AI-powered study coach."},
            "status": "rewarded",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": True},
            ],
            "review_reviewer_id": "user-business-demo",
            "review_status": "approved",
            "review_feedback": None,
            "reviewed_at": _dt("2026-09-29T10:00:00Z"),
            "reward": 20,
            "transaction_id": "tx-002",
            "submitted_at": _dt("2026-09-28T18:00:00Z"),
        },
        {
            "id": "sub-003",
            "task_id": "task-002",
            "task_title": "AI Response Evaluation",
            "contributor_id": "user-contributor-demo",
            "contributor_name": "Parth Sharma",
            "contributor_level": 4,
            "data": {"f1": "Response A", "f2": "4", "f3": "5", "f4": "3", "f5": "Response A was more factual but had a slightly formal tone."},
            "status": "under_review",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": True},
            ],
            "submitted_at": _dt("2026-10-04T14:00:00Z"),
        },
        {
            "id": "sub-004",
            "task_id": "task-005",
            "task_title": "Product Description Review",
            "contributor_id": "user-contributor-demo",
            "contributor_name": "Parth Sharma",
            "contributor_level": 4,
            "data": {"f1": "3", "f2": ["Tone mismatch"], "f3": "The description uses overly casual language for a B2B product."},
            "status": "rejected",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": False, "detail": "Only 1 of 3 required comments provided."},
            ],
            "review_reviewer_id": "user-business-demo",
            "review_status": "rejected",
            "review_feedback": "At least 3 descriptions must have a written comment. Only 1 was provided.",
            "reviewed_at": _dt("2026-10-02T10:00:00Z"),
            "submitted_at": _dt("2026-10-01T20:00:00Z"),
        },
        # Extra submissions from leaderboard users for business to review
        {
            "id": "sub-005",
            "task_id": "task-001",
            "task_title": "Product Image Categorization",
            "contributor_id": "lb-user-4",
            "contributor_name": "Aanya Kapoor",
            "contributor_level": 3,
            "data": {"f1": "Electronics", "f2": "High", "f3": ""},
            "status": "under_review",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": True},
            ],
            "submitted_at": _dt("2026-10-05T09:00:00Z"),
        },
        {
            "id": "sub-006",
            "task_id": "task-002",
            "task_title": "AI Response Evaluation",
            "contributor_id": "lb-user-5",
            "contributor_name": "Rohit Mehta",
            "contributor_level": 3,
            "data": {"f1": "Response B", "f2": "5", "f3": "4", "f4": "5", "f5": "Response B was clearer and more comprehensive."},
            "status": "under_review",
            "checks": [
                {"id": "ac1", "label": "Required fields complete", "passed": True},
                {"id": "ac2", "label": "No duplicate detected", "passed": True},
                {"id": "ac3", "label": "Format valid", "passed": True},
                {"id": "ac4", "label": "Task constraints satisfied", "passed": True},
            ],
            "submitted_at": _dt("2026-10-05T11:00:00Z"),
        },
    ]

    for sd in submissions_data:
        sub = Submission(
            id=sd["id"],
            task_id=sd["task_id"],
            task_title=sd["task_title"],
            contributor_id=sd["contributor_id"],
            contributor_name=sd["contributor_name"],
            contributor_level=sd["contributor_level"],
            data=sd["data"],
            status=sd["status"],
            automated_checks=sd["checks"],
            review_reviewer_id=sd.get("review_reviewer_id"),
            review_status=sd.get("review_status"),
            review_feedback=sd.get("review_feedback"),
            reviewed_at=sd.get("reviewed_at"),
            reward=sd.get("reward"),
            transaction_id=sd.get("transaction_id"),
            submitted_at=sd["submitted_at"],
        )
        db.add(sub)

    db.flush()

    # ============================
    # Reward Proofs for historical transactions
    # ============================
    proofs = [
        RewardProof(
            transaction_id="tx-001",
            task_id="task-001",
            submission_id="sub-001",
            contributor_id="user-contributor-demo",
            business_id="user-business-demo",
            reward=50,
            proof_hash="0x7f3a9b12...verified",
            network="TaskProof Local Network",
            status="verified",
            block_number=823451,
            timestamp=_dt("2026-09-21T15:30:00Z"),
        ),
        RewardProof(
            transaction_id="tx-002",
            task_id="task-004",
            submission_id="sub-002",
            contributor_id="user-contributor-demo",
            business_id="user-business-demo",
            reward=20,
            proof_hash="0x2c8d4f91...verified",
            network="TaskProof Local Network",
            status="verified",
            block_number=831892,
            timestamp=_dt("2026-09-29T10:15:00Z"),
        ),
    ]
    for proof in proofs:
        db.add(proof)

    db.commit()
    print("[OK] Seed complete!")
    print("   Demo Contributor: parth@taskproof.dev")
    print("   Demo Business:    admin@techcorp.com")
    print(f"   Tasks seeded:     {len(tasks_data)}")
    print(f"   Submissions:      {len(submissions_data)}")
    print()
    print("Run backend:")
    print("  uvicorn app.main:app --reload --port 8000")


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
