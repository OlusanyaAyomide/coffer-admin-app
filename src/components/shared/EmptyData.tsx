
import { Button } from "../ui/button";
import TransitionLink from "../layout/TransitionLink";


type EmptyDataProps<T> = {
  entityType: string,
  showAction?: boolean,
  actionPath?: string,
  data?: T[],
  isFilterActive?: boolean
  actionWord?: string
};
export default function EmptyData<T>({
  entityType,
  showAction = false,
  actionPath = '/admin/dashboard',
  data,
  isFilterActive,
  actionWord = 'added',
}: EmptyDataProps<T>) {
  if (!data || data.length > 0) {
    return null;
  }


  const emptyDataText = `No ${entityType} ${isFilterActive
    ? 'match your current filter.'
    : `have been ${actionWord} yet`}`;

  return (
    <div className="mx-auto flex flex-col items-center py-12 gap-[26px] justify-center my-auto max-w-[364px] w-full">
      <div className="flex items-center justify-center h-[300px] w-[300px] rounded-full">
        <img
          src="/Empty.svg"
          alt="Empty Data"
          width={300}
          height={300}
          className="mx-auto"
        />
      </div>
      <p className="text-muted-foreground text-center text-xl md:text-2xl font-normal leading-[100%] md:leading-9 tracking-[0.25px]">
        {emptyDataText}
      </p>
      <div className="w-full">
        {(showAction && !isFilterActive)
          ? (
            <TransitionLink to={actionPath}>
              <Button className="w-full">
                <span className="text-center text-sm font-medium leading-5 tracking-[0.1px]">
                  Add
                  {' '}
                  {entityType}
                </span>
              </Button>
            </TransitionLink>
          )
          : null}
      </div>

    </div>
  );
}
