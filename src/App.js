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

  const [config, setConfig] = useState({
    ticker: null,
    data: null,
    selected: null,
  });

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
    // svg.selectAll("rect[col='2']")

    // filtered = data.filter((d) => d.symbol === config.ticker);
    console.log("filtered! ", config.ticker);
  };

  let tickers;
  // let ticker = null;

  if (!loading) {
    const grouped = d3.group(data, (d) => d.symbol);

    tickers = [...grouped.keys()].sort();

    //default to first:
    // filterTickers(tickers[0]);
    // console.log(tickers)
  }

  const margin = { left: 100, right: 70, top: 50, bottom: 50 };

  return (
    <div className="App">
      {loading && <div className="loading">Loading data, please wait</div>}
      {!loading && (
        <div id="tickerList">
          {tickers.map((ticker, i) => (
            <a
              key={i}
              className={`ticker ticker-${i}`}
              href="#"
              onClick={() => filterTickers(ticker, i)}
            >
              {ticker}
            </a>
          ))}
        </div>
      )}
      {!loading && config.data && (
        <div id="contentGrid">
          <AdxChart
            config={config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <RsiChart
            config={config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <MovingAverageChart
            config={config}
            setConfig={handleConfigChange}
            margin={margin}
          />
          <PriceChart
            config={config}
            setConfig={handleConfigChange}
            margin={margin}
          />
        </div>
      )}
    </div>
  );
}

export default App;
