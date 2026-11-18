export interface AvatarItem {
  id: string;
  emoji: string;
  price: number; // in coins
}

// Cute characters kids can unlock/buy with coins earned in games.
export const AVATARS: AvatarItem[] = [
  { id: 'bunny', emoji: '🐰', price: 0 },
  { id: 'cat', emoji: '🐱', price: 50 },
  { id: 'robot', emoji: '🤖', price: 100 },
  { id: 'owl', emoji: '🦉', price: 120 },
  { id: 'fox', emoji: '🦊', price: 150 },
  { id: 'unicorn', emoji: '🦄', price: 250 },
  { id: 'dragon', emoji: '🐉', price: 400 },
  { id: 'panda', emoji: '🐼', price: 300 },
];

export function getAvatar(id: string): AvatarItem {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}