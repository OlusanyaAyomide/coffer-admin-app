
import { Button } from '../ui/button';
import type { AxiosError } from 'axios';
import type { QueryError } from '@/types/ResponseTypes';
import useWorkspaceNavigate from '@/hooks/useWorkspaceNavigate';

export default function ApiError<T>({
  error,
  data,
  customContent
}: {
  error: AxiosError<QueryError> | null,
  data?: T;
  customContent?: string;
}) {

  const navigate = useWorkspaceNavigate()

  if (data || !error) {
    return null;
  }

  const errorStatus = error?.response?.status;

  console.log(errorStatus)

  const errorMessage = errorStatus === 403 ? "No permitted to view this page" : customContent ? customContent : 'An error occurred'

  return (
    <div className="w-full pt-[84px] pb-20 min-h-[calc(100vh-99px)] grid place-items-center">
      <div className="flex flex-col w-full gap-[14px] max-w-[492px] sm:max-w-[686px] text-[#1E1E1E]">
        <div className="px-2 w-full max-w-[360px] md:max-w-[436px] lg:max-w-[580px] mx-auto aspect-8/]">
          <img
            className="h-[400px w-[400px] mx-auto"
            height={400}
            width={400}
            src={errorStatus === 403 ? "/Unauthorized.svg" : "/Error.svg"}
            alt="Something went wrong"
          />
          <p className="text-[20px] md:text-[24px] text-center text-popover-foreground leading-[28px] px-2 mb-[42px]">{errorMessage}</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard')}
          className="mt-2 w-full max-w-[500px] mx-auto"
        >
          Back To Home
        </Button>
      </div>
    </div>
  );
}
