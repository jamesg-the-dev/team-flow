import { ProjectActivityEntry, ProjectDetails, ProjectProgressPoint } from '@shared/models';

export const MOCK_PROGRESS_HISTORY: ProjectProgressPoint[] = [
  { week: 'Week 1', completed: 3 },
  { week: 'Week 2', completed: 5 },
  { week: 'Week 3', completed: 4 },
  { week: 'Week 4', completed: 8 },
  { week: 'Week 5', completed: 6 },
  { week: 'Week 6', completed: 9 },
  { week: 'Week 7', completed: 7 },
  { week: 'Week 8', completed: 11 },
  { week: 'Week 9', completed: 10 },
  { week: 'Week 10', completed: 13 },
  { week: 'Week 11', completed: 12 },
  { week: 'Week 12', completed: 15 },
];

export const MOCK_RECENT_ACTIVITY: ProjectActivityEntry[] = [
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
