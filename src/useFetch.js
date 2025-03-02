import {useState, useEffect, useCallback} from 'react';
import axios from 'axios';

export default function useFetch(url, disableFetchOnMount = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const myFetch = useCallback(() => {
    setLoading(true)
    setData(null);
    setError(null);
    const source = axios.CancelToken.source();
    axios.get(url, {cancelToken: source.token})
      .then(res => {
        setLoading(false);
        // Set multiple typical responses for various response formats
        res.data && setData(res.data);
        res.data.content && setData(res.data.content);
        res.content && setData(res.content);
      })
      .catch(err => {
        setLoading(false)
        setError(err)
      })
  }, [url]);

  useEffect(() => {
    if (disableFetchOnMount) return;
    myFetch()
  }, [myFetch, disableFetchOnMount])

  return {myFetch, data, loading, error}
}