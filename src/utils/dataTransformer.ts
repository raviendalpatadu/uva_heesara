import type { Archer } from '../types';
import { ParticipantApiService, type ApiParticipant } from '../services/participantApi';


export class DataTransformer {
  /**
   * Transform API participant data to Archer interface
   */
  static transformApiParticipant(apiParticipant: ApiParticipant, index: number): Archer {
    const age = ParticipantApiService.calculateAge(apiParticipant.DOB);


    return {
      id: `api-${index + 1}`,
      name: apiParticipant.Name.trim(),
      dateOfBirth: apiParticipant.DOB,
      age,
      gender: apiParticipant.Gender,
      contact: String(apiParticipant.Contact),
      club: apiParticipant.Club.trim(),
      primaryEvent: apiParticipant.Event.trim(),
      extraEvent: apiParticipant.ExtraEvent?.trim() ?? undefined,
      bowSharing: apiParticipant.BowSharing?.trim() ?? undefined,
      distance: age && age <= 18 ? '30m' : '70m',
    };
  }

  /**
   * Transform array of API participants to Archer array
   */
  static transformApiParticipants(apiParticipants: ApiParticipant[]): Archer[] {
    return apiParticipants.map((participant, index) => 
      this.transformApiParticipant(participant, index)
    );
  }

  /**
   * Validate API participant data
   */
  static validateApiParticipant(participant: any): participant is ApiParticipant {
    return (
      typeof participant === 'object' &&
      typeof participant.Name === 'string' &&
      (typeof participant.DOB === 'string' || typeof participant.DOB === 'number') &&
      (participant.Gender === 'Male' || participant.Gender === 'Female') &&
      (typeof participant.Contact === 'string' || typeof participant.Contact === 'number') &&
      typeof participant.Club === 'string' &&
      typeof participant.Event === 'string' &&
      (participant.ExtraEvent === undefined || typeof participant.ExtraEvent === 'string') &&
      (participant.BowSharing === undefined || typeof participant.BowSharing === 'string')
    );
  }

  /**
   * Filter and validate API response
   */
  static filterValidParticipants(data: any[]): ApiParticipant[] {
    const validParticipants: ApiParticipant[] = [];
    const invalidParticipants: any[] = [];

    data.forEach((item, index) => {
      if (this.validateApiParticipant(item)) {
        validParticipants.push(item);
      } else {
        invalidParticipants.push({ index, data: item });
      }
    });

    if (invalidParticipants.length > 0) {
      console.warn('Found invalid participant data:', invalidParticipants);
    }

    return validParticipants;
  }
}
