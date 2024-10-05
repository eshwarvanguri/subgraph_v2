import logo from './logo.svg';
import './App.css';
import { createClient, cacheExchange, fetchExchange } from 'urql';
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

// GraphQL API URL
const APIURL = "https://api.studio.thegraph.com/query/90300/newsubgraph/version/latest";

// Define queries
const queries = {
  assigns: `
    {
      assigns(first: 5) {
        id
        to
        punkIndex
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `,
  transfers: `
    {
      transfers(first: 5) {
        id
        from
        to
        value
        blockNumber
        blockTimestamp
        transactionHash
      }
    }
  `,
};

// Create URQL client with necessary exchanges
const client = createClient({
  url: APIURL,
  exchanges: [cacheExchange, fetchExchange]
});

function App() {
  const [assigns, setAssigns] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData(); // Initial data fetch
    const intervalId = setInterval(fetchData, 15000); // Refresh data every 15 seconds

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const responseAssigns = await client.query(queries.assigns).toPromise();
      const responseTransfers = await client.query(queries.transfers).toPromise();

      if (responseAssigns.data) {
        setAssigns(responseAssigns.data.assigns);
      }
      if (responseTransfers.data) {
        setTransfers(responseTransfers.data.transfers);
      }
    } catch (err) {
      setError('Error fetching data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Data for the Bar chart
  const chartData = {
    labels: transfers.map(t => t.id),
    datasets: [
      {
        label: 'Transfer Values',
        data: transfers.map(t => parseFloat(t.value)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
          <img src={logo} className="App-logo" alt="logo" />
        </div>
        <h1>Subgraph Data Visualizations</h1>
        <div className="navigation">
          <button onClick={() => document.getElementById('assigns-section').scrollIntoView({ behavior: 'smooth' })}>
            View Assigns
          </button>
          <button onClick={() => document.getElementById('transfers-section').scrollIntoView({ behavior: 'smooth' })}>
            View Transfers
          </button>
        </div>
      </header>
      <main className="App-main">
        {loading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        
        <h2>Transfer Values Graph</h2>
        <div className="chart-container">
          <Bar data={chartData} options={{ responsive: true }} />
        </div>

        <section id="assigns-section">
          <h2>Assigns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>To</th>
                <th>Punk Index</th>
                <th>Block Number</th>
                <th>Timestamp</th>
                <th>Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {assigns.map((assign) => (
                <tr key={assign.id} onClick={() => window.open(`https://example.com/${assign.transactionHash}`, '_blank')}>
                  <td>{assign.id}</td>
                  <td>{assign.to.length > 20 ? `${assign.to.slice(0, 20)}...` : assign.to}</td>
                  <td>{assign.punkIndex}</td>
                  <td>{assign.blockNumber}</td>
                  <td>{new Date(assign.blockTimestamp * 1000).toLocaleString()}</td>
                  <td>{assign.transactionHash.length > 20 ? `${assign.transactionHash.slice(0, 20)}...` : assign.transactionHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="transfers-section">
          <h2>Transfers</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>From</th>
                <th>To</th>
                <th>Value</th>
                <th>Block Number</th>
                <th>Timestamp</th>
                <th>Transaction Hash</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr key={transfer.id} onClick={() => window.open(`https://example.com/${transfer.transactionHash}`, '_blank')}>
                  <td>{transfer.id}</td>
                  <td>{transfer.from.length > 20 ? `${transfer.from.slice(0, 20)}...` : transfer.from}</td>
                  <td>{transfer.to.length > 20 ? `${transfer.to.slice(0, 20)}...` : transfer.to}</td>
                  <td>{transfer.value}</td>
                  <td>{transfer.blockNumber}</td>
                  <td>{new Date(transfer.blockTimestamp * 1000).toLocaleString()}</td>
                  <td>{transfer.transactionHash.length > 20 ? `${transfer.transactionHash.slice(0, 20)}...` : transfer.transactionHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
      <footer className="App-footer">
        <p>Data powered by The Graph</p>
      </footer>
    </div>
  );
}

export default App;
