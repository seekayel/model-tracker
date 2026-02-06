export interface Game {
  id: string;
  title: string;
  description: string;
  model: string;
  thumbnail: string;
  tags: string[];
  rating: number;
  playUrl: string;
}
