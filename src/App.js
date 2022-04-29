import "./App.css";
import { useState } from "react";
import { useData } from "./useData";
import * as d3 from "d3";
import AdxChart from "./AdxChart";
import RsiChart from "./RsiChart";
import MovingAverageChart from "./MovingAverageChart";
import PriceChart from "./PriceChart";
const classNames = require("classnames");

function App() {
  const { data, loading } = useData("https://storage.googleapis.com/download/storage/v1/b/mds-1-general/o/chart_data.csv?alt=media");
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
  const [filter, setFilter] = useState("");

  const margin = { left: 120, right: 30, top: 50, bottom: 50 };

  const getTickerClass = (ticker, i) => {
    if (ticker === defaultTicker)
      console.log(
        "recaculating, this time BTC is ",
        config.ticker === null && ticker === defaultTicker
      );
    return classNames({
      ticker: true,
      [`ticker-${i}`]: true,
      selected:
        (config.ticker === null && ticker === defaultTicker) ||
        ticker === config.ticker,
    });
  };
  const [showToggle, setShowToggle] = useState(false);
  const toggleMenu = (state) => {
    if (state === false) {
      return;
    }
    setShowToggle(!showToggle);
  };

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
    toggleMenu();
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      tickers.filter((f) => new RegExp(filter, "i").test(f)).length === 1
    ) {
      const ticker = tickers.filter((f) => new RegExp(filter, "i").test(f))[0];

      filterTickers(ticker, 0);
    }
  };

  let tickers;

  if (!loading) {
    const grouped = d3.group(data, (d) => d.symbol);
    tickers = [...grouped.keys()].sort();
  }

  return (
    <div className="App">
      <div className="hamburger" onClick={() => toggleMenu()}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </div>
      {loading && <div className="loading">Loading data, please wait</div>}
      {!loading && (
        <div id="tickerList" className={`${showToggle ? "showList" : ""}`}>
          <h1>Choose</h1>
          <input
            autoFocus
            id="filter"
            name="filter"
            type="text"
            placeholder="Filter ..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          {tickers
            .filter((f) => new RegExp(filter, "i").test(f))
            .map((ticker, i) => (
              <a
                key={i}
                className={getTickerClass(ticker, i)}
                href="#"
                onClick={() => filterTickers(ticker, i)}
              >
                {ticker}
              </a>
            ))}
        </div>
      )}
      {!loading && (
        <div id="contentGrid" onClick={() => toggleMenu(showToggle)}>
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
