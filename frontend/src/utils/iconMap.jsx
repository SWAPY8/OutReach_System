import React from 'react';
import {
  GraduationCap,
  LineChart,
  Users,
  Sprout,
  BookOpen,
  Activity,
  MessageCircleQuestion,
  Star,
  Award,
  TrendingUp,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export const getCategoryIcon = (iconName, size = 22) => {
  const name = (iconName || '').toLowerCase().trim();

  switch (name) {
    case 'graduation-cap':
    case 'teaching-quality':
    case 'teaching quality':
      return <GraduationCap size={size} strokeWidth={2.2} color="#1d4ed8" />;
    case 'line-chart':
    case 'practical-learning':
    case 'practical learning':
      return <LineChart size={size} strokeWidth={2.2} color="#059669" />;
    case 'users':
    case 'supportive-mentors':
    case 'supportive mentors':
      return <Users size={size} strokeWidth={2.2} color="#2563eb" />;
    case 'sprout':
    case 'beginner-friendly':
    case 'beginner friendly':
      return <Sprout size={size} strokeWidth={2.2} color="#10b981" />;
    case 'book-open':
    case 'course-content':
    case 'course content':
      return <BookOpen size={size} strokeWidth={2.2} color="#4f46e5" />;
    case 'activity':
    case 'live-market-sessions':
    case 'live market sessions':
      return <Activity size={size} strokeWidth={2.2} color="#d97706" />;
    case 'message-circle-question':
    case 'doubt-solving':
    case 'doubt solving':
      return <MessageCircleQuestion size={size} strokeWidth={2.2} color="#0284c7" />;
    case 'star':
    case 'overall-experience':
    case 'overall experience':
      return <Star size={size} strokeWidth={2.2} color="#eab308" />;
    default:
      return <Award size={size} strokeWidth={2.2} color="#1d4ed8" />;
  }
};

export const AVAILABLE_ICONS = [
  { value: 'graduation-cap', label: 'Teaching Quality (Graduation Cap)' },
  { value: 'line-chart', label: 'Practical Learning (Line Chart)' },
  { value: 'users', label: 'Supportive Mentors (Users)' },
  { value: 'sprout', label: 'Beginner Friendly (Sprout)' },
  { value: 'book-open', label: 'Course Content (Book Open)' },
  { value: 'activity', label: 'Live Market Sessions (Activity)' },
  { value: 'message-circle-question', label: 'Doubt Solving (Question)' },
  { value: 'star', label: 'Overall Experience (Star)' },
];
