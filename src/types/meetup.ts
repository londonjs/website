export interface Organizer {
  name: string;
  role: string;
  company: string;
  twitter?: string;
  linkedin: string;
  website?: string;
  image: string;
}

export interface Sponsor {
  name: string;
  logo: string;
  url: string;
}

export interface Speaker {
  name: string;
  role?: string;
}

export interface Talk {
  speaker: Speaker;
  title: string;
}

export interface Location {
  venue: string;
  address: string;
  mapLink?: string;
}

export interface Meetup {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: Location;
  meetupUrl: string;
  description: {
    markdown: string;
  };
  slug: string;
  status: 'upcoming' | 'past';
  talks?: Talk[];
  sponsors?: Sponsor[];
  organizers: Organizer[];
  refreshments: {
    description: string;
    markdown: boolean;
  };
  thingsToNote: {
    items: string[];
    markdown: boolean;
  };
  codeOfConductUrl: string;
}