import { useSearch } from '@tanstack/react-router';

const useReadParams = () => {
  const search = useSearch({ strict: false });

  const paramsObject = Object.entries(search).reduce((acc, [key, value]) => {
    if (typeof value === 'string') {
      const valuesArray = value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (valuesArray.length > 0) {
        acc[key] = valuesArray;
      }
    } else if (Array.isArray(value)) {
      acc[key] = value.map(String);
    }

    return acc;
  }, {} as Record<string, Array<string>>);

  return paramsObject;
};

export default useReadParams;