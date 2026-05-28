import { ProjectDetails } from '@shared/models';

const PROGRESS_HISTORY = [
  { week: 'Week 1', completed: 4 },
  { week: 'Week 2', completed: 7 },
  { week: 'Week 3', completed: 6 },
  { week: 'Week 4', completed: 7 },
];

const RECENT_ACTIVITY = [
  {
    id: '1',
    user: 'Sarah Chen',
    avatar: 'SC',
    action: 'completed task',
    target: 'Design system components',
    time: '2 hours ago',
  },
  {
    id: '2',
    user: 'Mike Johnson',
    avatar: 'MJ',
    action: 'uploaded',
    target: '3 files to Mockups folder',
    time: '4 hours ago',
  },
  {
    id: '3',
    user: 'Emily Davis',
    avatar: 'ED',
    action: 'commented on',
    target: 'User research findings',
    time: '5 hours ago',
  },
  {
    id: '4',
    user: 'Alex Kumar',
    avatar: 'AK',
    action: 'moved task',
    target: 'API integration to In Progress',
    time: '1 day ago',
  },
];

const TEAM = [
  { id: '1', name: 'Sarah Chen', avatar: 'SC', role: 'Lead Designer', email: 'sarah@acme.com' },
  { id: '2', name: 'Mike Johnson', avatar: 'MJ', role: 'Developer', email: 'mike@acme.com' },
  { id: '3', name: 'Emily Davis', avatar: 'ED', role: 'UX Researcher', email: 'emily@acme.com' },
  { id: '4', name: 'Alex Kumar', avatar: 'AK', role: 'Developer', email: 'alex@acme.com' },
  { id: '5', name: 'Jessica Lee', avatar: 'JL', role: 'Product Manager', email: 'jessica@acme.com' },
];

export const PROJECT_DETAILS: readonly ProjectDetails[] = [
  {
    id: '1',
    name: 'Product Redesign',
    description:
      'Complete overhaul of the product interface and user experience to improve usability, modernize the visual design, and enhance overall customer satisfaction.',
    status: 'active',
    progress: 75,
    priority: 'high',
    startDate: '2026-04-15',
    dueDate: '2026-05-30',
    budget: '$50,000',
    team: TEAM,
    tasks: { total: 32, completed: 24, inProgress: 5, todo: 3 },
    tags: ['Design', 'UX', 'Product'],
    attachments: 12,
    comments: 48,
    progressHistory: PROGRESS_HISTORY,
    recentActivity: RECENT_ACTIVITY,
  },
];

export function findProjectDetails(id: string): ProjectDetails | undefined {
  return PROJECT_DETAILS.find(p => p.id === id);
}
