import { activityApi } from '../api/activity.api';
import { IActivity, PaginatedActivity } from '../types/activity.type';

export const fetchActivitiesUseCase = async (filters: any): Promise<PaginatedActivity> => {
  try {
   
    const response = await activityApi.getActivities(filters);
    

    return response; 
  } catch (error) {
    console.error('Error in fetchActivitiesUseCase:', error);
    throw error;
  }
};