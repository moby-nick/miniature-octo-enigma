import "./App.css";
import { useState } from "react";
import { useData } from "./useData";
import * as d3 from "d3";
import AdxChart from "./AdxChart";
import RsiChart from "./RsiChart";
import MovingAverageChart from "./MovingAverageChart";
import PriceChart from "./PriceChart";

function App() {
  const { data, loading } = useData();
  const defaultTicker = "BTCUSD";
  const defaultConfig = {
    ticker: defaultTicker,
    data: loading ? null : data.filter((d) => d.symbol === defaultTicker),
    selected: null,
  };
  const [config, setConfig] = useState({
    ticker: null,
    data: null,
    selected: null,
  });

  const margin = { left: 120, right: 70, top: 50, bottom: 50 };

  const handleConfigChange = (config) => {
    setConfig(config);
  };

  const filterTickers = (selected, i) => {
    setConfig((config) => ({
      ...config,
      data: data.filter((d) => d.symbol === selected),
      ticker: selected,
    }));

    d3.selectAll(`.ticker`).classed("selected", false);
    d3.select(`.ticker-${i}`).classed("selected", true);
  };

  let tickers;

  if (!loading) {
    const grouped = d3.group(data, (d) => d.symbol);
    tickers = [...grouped.keys()].sort();

    const defaultIndex = tickers.indexOf(defaultTicker);
    if (defaultIndex > 0) {
      // filterTickers(defaultTicker, defaultIndex);
      console.log("found the default: ", defaultTicker, defaultIndex);
      // d3.select(`.ticker-${defaultIndex}`).classed("selected", true);

      // setConfig((config) => ({
      //   ...config,
      //   data: data.filter((d) => d.symbol === defaultTicker),
      //   ticker: defaultTicker,
      // }));
      // filterTickers(defaultTicker, defaultIndex)
    }
  }

  return (
    <div className="App">
      {loading && <div className="loading">Loading data, please wait</div>}
      {!loading && (
        <div id="tickerList">
          {tickers.map((ticker, i) => (
            <a
              key={i}
              className={`ticker ticker-${i} ${
                config.ticker === null && ticker === defaultTicker
                  ? "selected"
                  : ""
              }`}
              href="#"
              onClick={() => filterTickers(ticker, i)}
            >
              {ticker}
            </a>
          ))}
        </div>
      )}
      {!loading && (
        <div id="contentGrid">
          <PriceChart
            config={config.ticker === null ? defaultConfig : config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <MovingAverageChart
            config={config.ticker === null ? defaultConfig : config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <AdxChart
            config={config.ticker === null ? defaultConfig : config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <RsiChart
            config={config.ticker === null ? defaultConfig : config}
            setConfig={handleConfigChange}
            margin={margin}
          />
        </div>
      )}
    </div>
  );
}

export default App;
