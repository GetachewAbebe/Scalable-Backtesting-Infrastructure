import React, { useState } from 'react';
import axios from 'axios';
function BacktestForm() {
  const [parameters, setParameters] = useState({
    coin: '',
    strategy: '',
    startDate: '',
    endDate: '',
    startMoney: '',
    commission: 0,
  });
  const [strategyParams, setStrategyParams] = useState({});
  const [results, setResults] = useState(null);
  const strategies = {
    SMA: ['short_period', 'long_period', 'comm'],
    EMA: ['short_period', 'long_period', 'comm'],
    RSI: ['rsi_period', 'oversold', 'overbought'],
    MACD: ['fast_period', 'slow_period', 'signal_period', 'comm'],
    ADX: ['adx_period', 'adx_threshold', 'comm'],
    CCI: ['cci_period', 'cci_upper', 'cci_lower', 'comm'],
  };
  const handleChange = (e) => {
    setParameters({
      ...parameters,
      [e.target.name]: e.target.value,
    });
  };
  const handleStrategyChange = (e) => {
    const { value } = e.target;
    setParameters({
      ...parameters,
      strategy: value,
    });
    setStrategyParams(strategies[value] ? strategies[value].reduce((acc, param) => ({ ...acc, [param]: '' }), {}) : {});
  };
  const handleParamsChange = (e) => {
    setStrategyParams({
      ...strategyParams,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedStrategyParams = Object.keys(strategyParams).reduce((acc, key) => {
      acc[key] = parseFloat(strategyParams[key], 10);
      return acc;
    }, {});
    const params = { ...parameters, ...updatedStrategyParams };
    const data = {
      coin_name: params.coin,
      strategy_name: params.strategy,
      start_date: params.startDate,
      end_date: params.endDate,
      start_cash: parseInt(params.startMoney, 10),
      commission: parseFloat(params.commission, 10),
      params: Object.keys(updatedStrategyParams).map((key) => ({
        name: key,
        value: updatedStrategyParams[key],
      })),
    };
    console.log(data)
    try {
      const response = await axios.post('http://localhost:8000/scenes/backtest', data);
      console.log('response');
      console.log(response.data);
      setResults(response.data);
    } catch (error) {
      console.error('Error running backtest:', error);
      setResults({ error: 'Failed to run backtest. Please try again later.' });
    }
  };
  return (
    <div className="card bg-base-100 shadow-xl flex flex-row">
      <div className="card-body w-1/2">
        <h2 className="card-title">Backtest Parameters</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Coin Name</span>
            </label>
            <select name="coin" value={parameters.coin} onChange={handleChange} className="select select-bordered" required>
              <option value="" disabled>Select a coin</option>
              <option value="Bitcoin">Bitcoin</option>
              <option value="Ethereum">Ethereum</option>
              <option value="Binance coin">Binance coin</option>
              <option value="Cardano">Cardano</option>
              <option value="Dodgecoin">Dodgecoin</option>
              <option value="Gnosis">Gnosis</option>
              <option value="Solana">Solana</option>
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Strategy</span>
            </label>
            <select name="strategy" value={parameters.strategy} onChange={handleStrategyChange} className="select select-bordered" required>
              <option value="" disabled>Select a strategy</option>
              <option value="SMA">Simple Moving Average (SMA)</option>
              <option value="EMA">Exponential Moving Average (EMA)</option>
              <option value="RSI">Relative Strength Index (RSI)</option>
              <option value="MACD">Moving Average Convergence Divergence (MACD)</option>
              <option value="ADX">Average Directional Index (ADX)</option>
              <option value="CCI">Commodity Channel Index (CCI)</option>
            </select>
          </div>
          {parameters.strategy && Object.keys(strategyParams).map((param) => (
            <div className="form-control" key={param}>
              <label className="label">
                <span className="label-text">{param.replace('_', ' ')}</span>
              </label>
              <input
                type="number" // Ensuring that the input type is number for parameters
                name={param}
                value={strategyParams[param]}
                onChange={handleParamsChange}
                className="input input-bordered"
                required
              />
            </div>
          ))}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Date</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={parameters.startDate}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">End Date</span>
            </label>
            <input
              type="date"
              name="endDate"
              value={parameters.endDate}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Start Money (USD)</span>
            </label>
            <input
              type="number"
              name="startMoney"
              value={parameters.startMoney}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Commission (%)</span>
            </label>
            <input
              type="number"
              name="comm"
              value={parameters.comm}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>
          <div className="form-control mt-4">
            <button type="submit" className="btn btn-primary">
              Run Backtest
            </button>
          </div>
        </form>
      </div>



      {results && (
        <div className="card-body w-2/3">
          <h3 className="card-title">Backtest Results</h3>
          <div className="p-4 text-lg bg-gray-100 rounded-lg text-slate-800">
            {results.error ? (
              <p>{results.error}</p>
            ) : (
              <>
                <p><strong>Portfolio value:</strong> {results.final_portfolio_value}</p>
                <p><strong>Number of Trades:</strong> {results.total_trades}</p>
                <p><strong>Winning Trades:</strong> {results.winning_trades}</p>
                <p><strong>Losing Trades:</strong> {results.losing_trades}</p>
                <p><strong>Max Drawdown:</strong> {results.max_drawdown}</p>
                <p><strong>Max Moneydown:</strong> {results.max_moneydown}</p>
                <p><strong>Sharpe ratio:</strong> {results.sharpe_ratio}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default BacktestForm;