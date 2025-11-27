
export interface CharacterProfile {
  name: string;
  description: string;
  traits: string;
  backstory: string;
}

export interface WorldBuilding {
  geography: string;
  atmosphere: string;
  culture: string;
}

export interface PlotPoint {
  chapterIndex: number;
  type: 'Inciting Incident' | 'Rising Action' | 'Climax' | 'Falling Action' | 'Resolution';
  description: string;
}

export interface Chapter {
  title: string;
  content: string;
  imagePrompt: string;
  plotType?: string; // e.g., "The Climax"
}

export interface Story {
  title: string;
  world: WorldBuilding;
  characters: CharacterProfile[];
  plotOutline: PlotPoint[];
  chapters: Chapter[];
  ending: string;
}

export interface StoryState {
  status: 'idle' | 'generating_text' | 'reading' | 'error';
  story: Story | null;
  error?: string;
}

// Keyed by page index (0 = cover, 1..n = chapters, n+1 = ending)
export type ImageMap = Record<number, string>;

export enum LoadingStage {
  Initializing = "Dusting off the spellbook...",
  Analyzing = "Reading your grimoire...",
  WorldBuilding = "Forging the world...",
  Casting = "Summoning characters...",
  Writing = "Weaving the tale...",
  Illustrating = "Painting the scenes...",
  Finishing = "Binding the pages..."
}
