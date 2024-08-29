import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getDatasetGroupsProgress } from "services/datasets";
import sse from "services/sse-service";
import { SSEEventData, ValidationProgressData } from "types/datasetGroups";
import { datasetQueryKeys } from "utils/queryKeys";

export const useValidationSessions = () => {
    const [progresses, setProgresses] = useState<ValidationProgressData[]>([]);
  
    const { data: progressData, refetch } = useQuery<ValidationProgressData[]>(
      datasetQueryKeys.GET_DATASET_GROUP_PROGRESS(),
      getDatasetGroupsProgress,
      {
        onSuccess: (data) => setProgresses(data),
      }
    );
  
    const handleUpdate = (sessionId: string, newData: SSEEventData) => {
      setProgresses((prevProgresses) =>
        prevProgresses.map((progress) =>
          progress.id === sessionId ? { ...progress, ...newData } : progress
        )
      );
    };
  
    useEffect(() => {
      if (!progressData) return;
  
      const eventSources = progressData
        .filter(
          (progress) =>
            progress.validationStatus !== 'Success' &&
            progress.progressPercentage !== 100
        )
        .map((progress) =>
          sse(`/${progress.id}`, 'dataset', (data: SSEEventData) => {
            console.log(`New data for notification ${progress.id}:`, data);
            handleUpdate(data.sessionId, data);
          })
        );
  
      return () => {
        eventSources.forEach((eventSource) => eventSource?.close());
        console.log('SSE connections closed');
      };
    }, [progressData, refetch]);
  
    return progresses;
  };