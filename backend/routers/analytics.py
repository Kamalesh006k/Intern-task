from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
import models, database
import auth as auth_utils
from datetime import datetime, timedelta
import requests
import os
import json

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/", response_model=Dict[str, Any])
def retrieve_dashboard_metrics(
    active_user: models.User = Depends(auth_utils.retrieve_current_user), 
    db_session: Session = Depends(database.get_database_session)
):
    user_task_list = db_session.query(models.Task).filter(models.Task.user_id == active_user.id).all()
    
    if not user_task_list:
        return {
            "total_tasks": 0,
            "completed_tasks": 0,
            "in_progress_tasks": 0,
            "pending_tasks": 0,
            "completion_rate": 0,
            "average_completion_time_hours": 0,
            "fastest_completion_hours": 0,
            "slowest_completion_hours": 0,
            "ai_insights": [
                "Start creating tasks to see your productivity analytics!",
                "Set priorities and due dates to better manage your work.",
                "Track your progress and improve your productivity over time."
            ],
            "productivity_score": 0,
            "tasks_by_priority": {"low": 0, "medium": 0, "high": 0},
            "completion_trend": [],
            "weekly_pattern": [],
            "time_distribution": {"morning": 0, "afternoon": 0, "evening": 0, "night": 0},
            "overdue_tasks": 0
        }
    
    total_count = len(user_task_list)
    completed_count = len([t for t in user_task_list if t.status == 'completed'])
    in_progress_count = len([t for t in user_task_list if t.status == 'in_progress'])
    pending_count = len([t for t in user_task_list if t.status == 'pending'])
    
    comp_rate = (completed_count / total_count * 100) if total_count > 0 else 0
    
    durations = []
    for task_item in user_task_list:
        if task_item.completed_at and task_item.started_at:
            delta = task_item.completed_at - task_item.started_at
            durations.append(delta.total_seconds() / 3600)
    
    mean_duration = sum(durations) / len(durations) if durations else 0
    min_duration = min(durations) if durations else 0
    max_duration = max(durations) if durations else 0
    
    priority_breakdown = {
        "low": len([t for t in user_task_list if t.priority == 'low']),
        "medium": len([t for t in user_task_list if t.priority == 'medium']),
        "high": len([t for t in user_task_list if t.priority == 'high'])
    }
    
    current_time = datetime.now()
    late_count = len([t for t in user_task_list if t.due_date and t.due_date < current_time and t.status != 'completed'])
    
    score_val = min(100, int(
        (comp_rate * 0.4) +
        (min(completed_count / 10, 1) * 30) +
        (20 if mean_duration > 0 and mean_duration < 24 else 10) +
        (10 if late_count == 0 else max(0, 10 - late_count * 2))
    ))
    
    trend_data = []
    for day_offset in range(6, -1, -1):
        target_date = datetime.now() - timedelta(days=day_offset)
        start_of_day = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        daily_completed = len([
            t for t in user_task_list 
            if t.completed_at and start_of_day <= t.completed_at < end_of_day
        ])
        
        daily_created = len([
            t for t in user_task_list 
            if start_of_day <= t.created_at < end_of_day
        ])
        
        trend_data.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "day": target_date.strftime("%a"),
            "completed": daily_completed,
            "created": daily_created
        })
    
    weekly_dist = []
    for day_idx in range(7):
        day_label = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day_idx]
        day_completed = len([
            t for t in user_task_list
            if t.completed_at and t.completed_at.weekday() == day_idx
        ])
        weekly_dist.append({"day": day_label, "completed": day_completed})
    
    time_slots = {"morning": 0, "afternoon": 0, "evening": 0, "night": 0}
    for t_item in user_task_list:
        if t_item.completed_at:
            hr = t_item.completed_at.hour
            if 6 <= hr < 12:
                time_slots["morning"] += 1
            elif 12 <= hr < 18:
                time_slots["afternoon"] += 1
            elif 18 <= hr < 22:
                time_slots["evening"] += 1
            else:
                time_slots["night"] += 1
    
    
    # Try AI generation first
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    insights_list = []
    
    if openrouter_key:
        try:
            insights_list = generate_ai_insights(
                active_user.username, total_count, completed_count, pending_count, 
                comp_rate, mean_duration, priority_breakdown, score_val, late_count
            )
        except Exception as e:
            print(f"AI Insights Error: {e}")
            # Fallback will be used if list remains empty or error occurs
            pass

    # Use manual fallback if AI failed or returned nothing
    if not insights_list:
        insights_list = generate_manual_insights(
            total_count, completed_count, in_progress_count, pending_count,
            comp_rate, mean_duration, priority_breakdown, score_val,
            late_count, min_duration, max_duration
        )
    
    return {
        "total_tasks": total_count,
        "completed_tasks": completed_count,
        "in_progress_tasks": in_progress_count,
        "pending_tasks": pending_count,
        "completion_rate": round(comp_rate, 1),
        "average_completion_time_hours": round(mean_duration, 2),
        "fastest_completion_hours": round(min_duration, 2),
        "slowest_completion_hours": round(max_duration, 2),
        "ai_insights": insights_list,
        "productivity_score": score_val,
        "tasks_by_priority": priority_breakdown,
        "completion_trend": trend_data,
        "weekly_pattern": weekly_dist,
        "time_distribution": time_slots,
        "overdue_tasks": late_count
    }

def generate_manual_insights(total, completed, in_prog, pending, rate, avg_t, prio_dist, score, overdue, fast_t, slow_t):
    suggestions = []
    
    if rate >= 80:
        suggestions.append("🎉 Excellent! You're completing 80%+ of your tasks. Keep up the great work!")
    elif rate >= 60:
        suggestions.append("👍 Good job! You're completing most of your tasks. Try to push that completion rate higher!")
    elif rate >= 40:
        suggestions.append("📊 You're making progress, but there's room for improvement. Focus on completing pending tasks.")
    else:
        suggestions.append("⚠️ Your completion rate is low. Consider breaking down tasks into smaller, manageable pieces.")
    
    if avg_t > 0:
        if avg_t < 2:
            suggestions.append("⚡ You're completing tasks quickly! Average time: {:.1f} hours. Great efficiency!".format(avg_t))
        elif avg_t < 8:
            suggestions.append("⏱️ Your average completion time is {:.1f} hours. Consider if tasks can be completed faster.".format(avg_t))
        else:
            suggestions.append("🐌 Tasks are taking {:.1f} hours on average. Break them into smaller subtasks for better progress tracking.".format(avg_t))
    
    if fast_t > 0 and slow_t > 0:
        if slow_t / fast_t > 5:
            suggestions.append("📈 Large variation in completion times ({:.1f}h to {:.1f}h). Try to estimate task complexity better.".format(fast_t, slow_t))
    
    top_prio = prio_dist.get('high', 0)
    if top_prio > total * 0.5:
        suggestions.append("🔥 Over 50% of your tasks are high priority. Consider if all are truly urgent or if priorities need adjustment.")
    elif top_prio == 0 and total > 0:
        suggestions.append("💡 No high-priority tasks detected. Make sure you're identifying and prioritizing critical work.")
    
    if overdue > 0:
        suggestions.append("⏰ You have {} overdue tasks! Prioritize these to get back on track.".format(overdue))
    else:
        suggestions.append("✅ No overdue tasks! You're managing your deadlines well.")
    
    if in_prog > 5:
        suggestions.append("🎯 You have {} tasks in progress. Focus on completing them before starting new ones.".format(in_prog))
    elif in_prog == 0 and pending > 0:
        suggestions.append("🚀 No tasks in progress! Start working on your {} pending tasks.".format(pending))
    
    if score >= 80:
        suggestions.append("🌟 Outstanding productivity score: {}! You're a task management champion!".format(score))
    elif score >= 60:
        suggestions.append("💪 Solid productivity score: {}. You're doing well, keep pushing!".format(score))
    else:
        suggestions.append("📈 Productivity score: {}. There's potential to improve - start by completing more tasks!".format(score))
    
    return suggestions[:7]

def generate_ai_insights(username, total, completed, pending, rate, avg_time, priorities, score, overdue):
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    prompt = f"""
    Analyze the productivity of user '{username}':
    - Total Tasks: {total}
    - Completed: {completed} ({rate:.1f}% rate)
    - Pending: {pending}
    - Overdue: {overdue}
    - Avg Completion Time: {avg_time:.1f} hours
    - Productivity Score: {score}/100
    - Priority Distribution: {priorities}
    
    Provide 3-5 concise, encouraging, and actionable bullet points (insights) to help them improve. 
    Focus on specific data points. Return ONLY a JSON array of strings, e.g. ["Insight 1", "Insight 2"].
    """
    
    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {openrouter_key}",
                "Content-Type": "application/json",
                # "HTTP-Referer": "http://localhost:5173", 
            },
            json={
                "model": "openai/gpt-3.5-turbo",
                "messages": [
                    {"role": "system", "content": "You are a productivity expert analyst. Output strictly valid JSON."},
                    {"role": "user", "content": prompt}
                ]
            },
            timeout=5 # Short timeout to prevent long page loads
        )
        
        if response.status_code == 200:
            content = response.json()['choices'][0]['message']['content']
            # Attempt to parse JSON
            try:
                # Clean up potential markdown formatting ```json ... ```
                if "```" in content:
                    content = content.replace("```json", "").replace("```", "")
                return json.loads(content)
            except:
                # If parsing fails, just return the raw text as a single insight if it's short, or split by lines
                return [line.strip("- *") for line in content.split("\n") if line.strip()]
    except Exception as e:
        print(f"AI Generation Error: {e}")
            
    return []
