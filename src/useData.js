import * as d3 from "d3";
import { useState, useEffect } from "react";

export const useData = (url) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // console.log('useData.js; idem fetchat ', new Date().getMilliseconds())
    const promises = [d3.csv(url, d3.autoType)];

    Promise.all(promises).then((data) => {
      setData(data[0]);
      setLoading(false);
    });

    return () => undefined;
  }, []);

  return {
    data,
    loading,
  };
};
