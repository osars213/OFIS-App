import { Space } from '../types';

export class GoogleGenAIService {
  static async matchSpaceWithAi(
    userPrompt: string,
    availableSpaces: Space[]
  ): Promise<{ recommendationText: string; spaceId?: string }> {
    const promptLower = userPrompt.toLowerCase();

    // Intelligent keyword-based matching against available inventory
    let matchedSpace = availableSpaces[0];

    if (promptLower.includes('podcast') || promptLower.includes('audio') || promptLower.includes('mic') || promptLower.includes('sound')) {
      const podcastSpace = availableSpaces.find(s => s.category === 'podcast');
      if (podcastSpace) matchedSpace = podcastSpace;
    } else if (promptLower.includes('photo') || promptLower.includes('video') || promptLower.includes('shoot') || promptLower.includes('cyclorama')) {
      const photoSpace = availableSpaces.find(s => s.category === 'photography');
      if (photoSpace) matchedSpace = photoSpace;
    } else if (promptLower.includes('meeting') || promptLower.includes('boardroom') || promptLower.includes('zoom') || promptLower.includes('client')) {
      const meetingSpace = availableSpaces.find(s => s.category === 'meeting');
      if (meetingSpace) matchedSpace = meetingSpace;
    } else if (promptLower.includes('event') || promptLower.includes('hall') || promptLower.includes('seminar') || promptLower.includes('workshop')) {
      const eventSpace = availableSpaces.find(s => s.category === 'event');
      if (eventSpace) matchedSpace = eventSpace;
    } else if (promptLower.includes('private') || promptLower.includes('team') || promptLower.includes('executive')) {
      const officeSpace = availableSpaces.find(s => s.category === 'private_office');
      if (officeSpace) matchedSpace = officeSpace;
    } else if (promptLower.includes('lekki')) {
      const lekkiSpace = availableSpaces.find(s => (s.neighborhood || '').toLowerCase().includes('lekki'));
      if (lekkiSpace) matchedSpace = lekkiSpace;
    } else if (promptLower.includes('abuja') || promptLower.includes('maitama')) {
      const abujaSpace = availableSpaces.find(s => (s.city || '').toLowerCase().includes('abuja') || (s.neighborhood || '').toLowerCase().includes('maitama'));
      if (abujaSpace) matchedSpace = abujaSpace;
    } else if (promptLower.includes('ikeja')) {
      const ikejaSpace = availableSpaces.find(s => (s.neighborhood || '').toLowerCase().includes('ikeja'));
      if (ikejaSpace) matchedSpace = ikejaSpace;
    }

    if (!matchedSpace) {
      return {
        recommendationText: 'We found spaces available in Lagos and Abuja. Explore our directory to choose your preferred workspace.',
      };
    }

    return {
      recommendationText: `Based on your request, I strongly recommend **${matchedSpace.title}** located in ${matchedSpace.neighborhood}, ${matchedSpace.city}. It features guaranteed ${matchedSpace.powerType} (${matchedSpace.powerUptimeGuaranteePercent}% uptime), ${matchedSpace.internetSpeedMbps} Mbps fiber via ${matchedSpace.internetIsp}, and capacity for ${matchedSpace.capacity} people.`,
      spaceId: matchedSpace.id,
    };
  }
}
