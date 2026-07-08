export type Screen = 'login' | 'wod' | 'home' | 'create-group' | 'join-group' | 'profile';

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  rank?: number;
  score?: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  rank?: number;
  type: 'private' | 'official' | 'suggestion';
  imageUrl?: string;
}
