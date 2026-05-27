import { Channel, Message } from '@shared/models';

export const CHANNELS: readonly Channel[] = [
  { id: '1', name: 'general', isPrivate: false, unread: 3 },
  { id: '2', name: 'product-design', isPrivate: false, unread: 12 },
  { id: '3', name: 'engineering', isPrivate: false },
  { id: '4', name: 'marketing', isPrivate: false, unread: 5 },
  { id: '5', name: 'leadership', isPrivate: true },
  { id: '6', name: 'random', isPrivate: false },
];

export const CHANNEL_MESSAGES: readonly Message[] = [
  {
    id: '1',
    author: 'Sarah Chen',
    avatar: 'SC',
    content:
      'Hey team! I just shared the latest design mockups in Figma. Would love to get your feedback by EOD.',
    timestamp: '9:30 AM',
    reactions: [
      { emoji: '👍', count: 5, users: ['MJ', 'ED', 'AK', 'JL', 'RK'] },
      { emoji: '👀', count: 2, users: ['MJ', 'ED'] },
    ],
    isPinned: true,
  },
  {
    id: '2',
    author: 'Mike Johnson',
    avatar: 'MJ',
    content:
      'Looks great! I particularly like the new navigation structure. One question though - have we considered how this will work on mobile?',
    timestamp: '9:45 AM',
    replies: [
      {
        id: '2-1',
        author: 'Sarah Chen',
        avatar: 'SC',
        content: "Good point! I'll add mobile mockups to the file today.",
        timestamp: '9:50 AM',
      },
      {
        id: '2-2',
        author: 'Emily Davis',
        avatar: 'ED',
        content: 'I can help with the responsive design if needed',
        timestamp: '10:05 AM',
      },
    ],
  },
  {
    id: '3',
    author: 'Alex Kumar',
    avatar: 'AK',
    content:
      'Quick update: The API migration is 90% complete. We should be ready to deploy by Friday.',
    timestamp: '10:30 AM',
    reactions: [
      {
        emoji: '🎉',
        count: 8,
        users: ['SC', 'MJ', 'ED', 'JL', 'RK', 'TH', 'KM', 'LP'],
      },
    ],
  },
  {
    id: '4',
    author: 'Emily Davis',
    avatar: 'ED',
    content: "Has anyone seen issues with the staging environment? I'm getting some weird errors.",
    timestamp: '11:15 AM',
  },
  {
    id: '5',
    author: 'Jessica Lee',
    avatar: 'JL',
    content: '@Alex Kumar Can you take a look? Might be related to your recent changes.',
    timestamp: '11:20 AM',
  },
];
