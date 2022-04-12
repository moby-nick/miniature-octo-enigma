import "./App.css";
import { useState } from "react";
import { useData } from "./useData";
import * as d3 from "d3";
import AdxChart from "./AdxChart";

function App() {
  const { data, loading } = useData();

  const [config, setConfig] = useState({
    ticker: null,
    data: null,
  });

  const filterTickers = (selected,i) => {
    setConfig((config) => ({
      data: data.filter((d) => d.symbol === selected),
      ticker: selected,
    }));

    d3.selectAll(`.ticker`).classed('selected', false);
    d3.select(`.ticker-${i}`).classed('selected', true);
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

  return (
    <div className="App">
      {loading && <div className="loading">Loading data, please wait</div>}
      {!loading && (
        <div id="tickerList">
          {tickers.map((ticker, i) => (
            <a key={i} className={`ticker ticker-${i}`} href="#" onClick={() => filterTickers(ticker,i)}>
              {ticker}
            </a>
          ))}
        </div>
      )}
      {!loading && config.data && (
        <div id="contentGrid">
          <AdxChart config={config} />
          <AdxChart config={config} />
          <AdxChart config={config} />
          <AdxChart config={config} />
        </div>
      )}
    </div>
  );
}

export default App;
