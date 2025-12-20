import { ImportData, ApiResponse, ApiResponseSuccess, ApiResponseError } from '../types';

export const importLink = async (data: ImportData, apiEndpoint: string): Promise<ApiResponse> => {
  try {
    if (!apiEndpoint || !apiEndpoint.startsWith('http')) {
        throw new Error('Invalid or missing API Endpoint URL.');
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Parse the JSON response. We use `any` here because the actual structure from the server can vary.
    const responseData: any = await response.json();

    if (!response.ok) {
        // Try to find a meaningful error message from the response body, which could be in several places.
        const errorMessage = responseData?.data?.message || responseData?.message || `Request failed with status: ${response.status}`;
        throw new Error(errorMessage);
    }
    
    // Normalize the success response, as the backend might return the ID in different ways (e.g., ID, id).
    const postId = responseData?.data?.ID || responseData?.ID || responseData?.data?.id || responseData?.id;

    if (typeof postId !== 'number') {
        // This case handles a successful HTTP status but an unreadable response body.
        console.error("Unexpected successful response format from server. Could not find Post ID:", responseData);
        throw new Error('Import successful, but the app could not confirm the Draft ID from the server\'s response. Please check your WordPress drafts manually.');
    }

    // Construct the standardized success response that the UI component expects.
    const successResponse: ApiResponseSuccess = {
        success: true,
        data: {
            ID: postId
        }
    };

    return successResponse;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
    return {
        success: false,
        data: { message },
    };
  }
};